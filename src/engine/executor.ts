import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { URL } from 'url';
import {
  RCaseDocument,
  EndpointDefinition,
  TestCaseDefinition,
  ExecutedTestCase,
  TestSuiteResult,
  ExecutionOptions
} from '../models/types';
import { buildUrl } from './template';
import { redactHeaders, sanitizePreview } from './redaction';
import { evaluateAssertions } from './assertions';
import { resolveBuiltinVariables, resolveObjectVariables } from './variables';
import { loadEnvironment, resolveEnvVariables, resolveEnvInObject } from './environment';
import { evaluateCapture } from './capture';

export class TestExecutor {
  private aborted = false;

  public cancel(): void {
    this.aborted = true;
  }

  public async executeSuite(
    document: RCaseDocument,
    filePath: string,
    options: ExecutionOptions = {}
  ): Promise<TestSuiteResult> {
    this.aborted = false;
    const suiteStartTime = Date.now();
    const results: ExecutedTestCase[] = [];

    // Persistent capture store across sequential test case executions within the suite
    const captureStore: Record<string, string> = { ...(options.captureStore || {}) };
    const workspacePath = options.workspacePath || (filePath ? path.dirname(filePath) : undefined);
    const envVars = loadEnvironment(workspacePath, options.env);

    // Flatten all test cases across all endpoints, applying filters if specified
    const tasks: Array<{
      endpoint: EndpointDefinition;
      testCase: TestCaseDefinition;
      kind: 'success' | 'error';
    }> = [];

    for (const endpoint of document.tests) {
      if (options.filter?.endpointName && endpoint.name !== options.filter.endpointName) {
        continue;
      }
      if (endpoint.success) {
        for (const sc of endpoint.success) {
          if (options.filter?.caseName && sc.name !== options.filter.caseName) {
            continue;
          }
          tasks.push({ endpoint, testCase: sc, kind: 'success' });
        }
      }
      if (endpoint.errors) {
        for (const ec of endpoint.errors) {
          if (options.filter?.caseName && ec.name !== options.filter.caseName) {
            continue;
          }
          tasks.push({ endpoint, testCase: ec, kind: 'error' });
        }
      }
    }

    // Execute sequentially
    for (let i = 0; i < tasks.length; i++) {
      if (this.aborted || (options.signal && options.signal.aborted)) {
        // Mark remaining tasks as CANCELLED
        for (let j = i; j < tasks.length; j++) {
          const { endpoint, testCase, kind } = tasks[j];
          results.push({
            id: `${endpoint.name}::${testCase.name}::${j}`,
            endpointName: endpoint.name,
            caseName: testCase.name,
            caseKind: kind,
            method: endpoint.method,
            url: '(cancelled before execution)',
            redactedHeaders: {},
            status: 'CANCELLED',
            durationMs: 0,
            assertions: [],
            error: 'Test suite execution was cancelled by user.',
            timestamp: Date.now()
          });
        }
        break;
      }

      const { endpoint, testCase, kind } = tasks[i];
      const caseId = `${endpoint.name}::${testCase.name}::${i}`;

      if (options.onCaseStart) {
        options.onCaseStart({ id: caseId, endpointName: endpoint.name, caseName: testCase.name });
      }

      const executedResult = await this.executeSingleCase(
        document.baseUrl,
        document.headers,
        endpoint,
        testCase,
        kind,
        caseId,
        options,
        envVars,
        captureStore
      );

      results.push(executedResult);

      if (options.onCaseComplete) {
        options.onCaseComplete(executedResult);
      }
    }

    const totalDuration = Date.now() - suiteStartTime;
    const passedCount = results.filter(r => r.status === 'PASS').length;
    const failedCount = results.filter(r => r.status === 'FAIL').length;
    const errorCount = results.filter(r => r.status === 'ERROR' || r.status === 'CANCELLED').length;

    return {
      filePath,
      suiteName: document.name || 'RouteCase Test Suite',
      totalCount: results.length,
      passedCount,
      failedCount,
      errorCount,
      durationMs: totalDuration,
      results
    };
  }

  public async executeSingleCase(
    baseUrl: string,
    commonHeaders: Record<string, string> | undefined,
    endpoint: EndpointDefinition,
    testCase: TestCaseDefinition,
    kind: 'success' | 'error',
    id: string,
    options: ExecutionOptions = {},
    contextEnv?: Record<string, string>,
    captureStore?: Record<string, string>
  ): Promise<ExecutedTestCase> {
    const startTime = Date.now();

    const env = contextEnv ?? loadEnvironment(options.workspacePath, options.env);
    const activeCaptureStore = captureStore ?? options.captureStore;
    const mergedEnv: Record<string, string> = {
      ...env,
      ...(activeCaptureStore || {})
    };

    // Resolve variables in baseUrl
    const resolvedBaseUrl = resolveBuiltinVariables(resolveEnvVariables(baseUrl, mergedEnv));

    // Resolve commonHeaders and endpoint.headers
    const resolvedCommonHeaders = commonHeaders
      ? (resolveObjectVariables(resolveEnvInObject(commonHeaders, mergedEnv)) as Record<string, string>)
      : undefined;

    const resolvedEndpointHeaders = endpoint.headers
      ? (resolveObjectVariables(resolveEnvInObject(endpoint.headers, mergedEnv)) as Record<string, string>)
      : undefined;

    // Resolve testCase fields: params, query, headers, body
    // Do NOT modify testCase.expect — assertions stay as-is
    const resolvedParams = testCase.params
      ? (resolveObjectVariables(resolveEnvInObject(testCase.params, mergedEnv)) as Record<string, string | number | boolean>)
      : undefined;

    const resolvedQuery = testCase.query
      ? (resolveObjectVariables(resolveEnvInObject(testCase.query, mergedEnv)) as Record<string, string | number | boolean>)
      : undefined;

    const resolvedCaseHeaders = testCase.headers
      ? (resolveObjectVariables(resolveEnvInObject(testCase.headers, mergedEnv)) as Record<string, string>)
      : undefined;

    const resolvedBody = testCase.body !== undefined && testCase.body !== null
      ? resolveObjectVariables(resolveEnvInObject(testCase.body, mergedEnv))
      : testCase.body;

    // 1. Resolve path template and construct full URL
    const urlResult = buildUrl(resolvedBaseUrl, endpoint.path, resolvedParams, resolvedQuery);
    if (!urlResult.success || !urlResult.url) {
      return {
        id,
        endpointName: endpoint.name,
        caseName: testCase.name,
        caseKind: kind,
        method: endpoint.method,
        url: `${resolvedBaseUrl}${endpoint.path}`,
        redactedHeaders: {},
        status: 'ERROR',
        durationMs: Date.now() - startTime,
        assertions: [],
        error: urlResult.error || 'Failed to resolve URL template',
        timestamp: Date.now()
      };
    }

    const targetUrl = urlResult.url;

    // 2. Merge headers: file-level < endpoint-level < case-level
    const mergedHeaders: Record<string, string> = {
      ...(resolvedCommonHeaders || {}),
      ...(resolvedEndpointHeaders || {}),
      ...(resolvedCaseHeaders || {})
    };

    let serializedBody: string | undefined;
    if (resolvedBody !== undefined && resolvedBody !== null) {
      if (typeof resolvedBody === 'string') {
        serializedBody = resolvedBody;
      } else {
        serializedBody = JSON.stringify(resolvedBody);
        if (!Object.keys(mergedHeaders).some(k => k.toLowerCase() === 'content-type')) {
          mergedHeaders['Content-Type'] = 'application/json';
        }
      }
      mergedHeaders['Content-Length'] = Buffer.byteLength(serializedBody).toString();
    }

    const safeHeaders = redactHeaders(mergedHeaders);

    // 3. Execute HTTP request
    const timeoutMs = options.timeoutMs ?? 10000;
    const maxSizeBytes = options.maxResponseSizeBytes ?? 5 * 1024 * 1024;
    const followRedirects = options.followRedirects ?? false;

    try {
      const response = await this.sendHttpRequest({
        method: endpoint.method,
        url: targetUrl,
        headers: mergedHeaders,
        body: serializedBody,
        timeoutMs,
        maxSizeBytes,
        followRedirects,
        signal: options.signal
      });

      const durationMs = Date.now() - startTime;

      // 4. Response Variable Chaining (Token Capture)
      let capturedThisCase: Record<string, string> | undefined;
      if (testCase.capture && typeof testCase.capture === 'object') {
        const extracted = evaluateCapture(testCase.capture, response.body);
        if (Object.keys(extracted).length > 0) {
          capturedThisCase = extracted;
          if (activeCaptureStore) {
            Object.assign(activeCaptureStore, extracted);
          }
        }
      }

      // 5. Evaluate assertions
      const assertionOutcome = evaluateAssertions(
        testCase.expect,
        response.statusCode,
        response.body,
        response.headers,
        durationMs
      );

      return {
        id,
        endpointName: endpoint.name,
        caseName: testCase.name,
        caseKind: kind,
        method: endpoint.method,
        url: targetUrl,
        redactedHeaders: safeHeaders,
        requestBody: resolvedBody,
        status: assertionOutcome.passed ? 'PASS' : 'FAIL',
        actualStatus: response.statusCode,
        actualHeaders: response.headers,
        actualBody: sanitizePreview(response.body),
        durationMs,
        assertions: assertionOutcome.assertions,
        captured: capturedThisCase,
        timestamp: Date.now()
      };
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      return {
        id,
        endpointName: endpoint.name,
        caseName: testCase.name,
        caseKind: kind,
        method: endpoint.method,
        url: targetUrl,
        redactedHeaders: safeHeaders,
        requestBody: resolvedBody,
        status: 'ERROR',
        durationMs,
        assertions: [],
        error: errorMessage,
        timestamp: Date.now()
      };
    }
  }

  private sendHttpRequest(params: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    timeoutMs: number;
    maxSizeBytes: number;
    followRedirects: boolean;
    signal?: AbortSignal;
  }): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }> {
    return new Promise((resolve, reject) => {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(params.url);
      } catch {
        return reject(new Error(`Malformed URL: "${params.url}"`));
      }

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return reject(new Error(`Unsupported protocol "${parsedUrl.protocol}". Only http: and https: are supported.`));
      }

      const client = parsedUrl.protocol === 'https:' ? https : http;

      const reqOptions: http.RequestOptions = {
        method: params.method,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        headers: params.headers,
        timeout: params.timeoutMs
      };

      let aborted = false;

      const req = client.request(reqOptions, res => {
        const statusCode = res.statusCode || 0;

        // Redirect check
        if ([301, 302, 303, 307, 308].includes(statusCode)) {
          if (!params.followRedirects) {
            // Keep redirect as normal response rather than silently following
          } else {
            const location = res.headers.location;
            if (location) {
              try {
                const nextUrl = new URL(location, params.url);
                if (nextUrl.origin !== parsedUrl.origin) {
                  return reject(new Error(`Cross-origin redirect to "${nextUrl.origin}" blocked for safety.`));
                }
              } catch {
                return reject(new Error(`Invalid redirect Location header: "${location}"`));
              }
            }
          }
        }

        const responseHeaders: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.headers)) {
          if (v !== undefined) {
            responseHeaders[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : v;
          }
        }

        let bodyBuffer = '';
        let bytesReceived = 0;

        res.setEncoding('utf8');

        res.on('data', chunk => {
          bytesReceived += Buffer.byteLength(chunk, 'utf8');
          if (bytesReceived > params.maxSizeBytes) {
            req.destroy();
            return reject(new Error(`Response exceeded maximum size limit of ${params.maxSizeBytes} bytes.`));
          }
          bodyBuffer += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode,
            headers: responseHeaders,
            body: bodyBuffer
          });
        });
      });

      req.on('timeout', () => {
        aborted = true;
        req.destroy();
        reject(new Error(`Request timed out after ${params.timeoutMs}ms.`));
      });

      req.on('error', err => {
        if (aborted) return;
        const msg = (err as { code?: string }).code === 'ECONNREFUSED'
          ? `Connection refused at ${parsedUrl.host}. Is the API server running?`
          : err.message;
        reject(new Error(msg));
      });

      if (params.signal) {
        params.signal.addEventListener('abort', () => {
          aborted = true;
          req.destroy();
          reject(new Error('Request cancelled by user.'));
        });
      }

      if (this.aborted) {
        req.destroy();
        return reject(new Error('Test run stopped.'));
      }

      if (params.body) {
        req.write(params.body);
      }
      req.end();
    });
  }
}
