import { RCaseDocument, EndpointDefinition, TestCaseDefinition } from '../models/types';
import { buildUrl } from './template';
import { resolveBuiltinVariables, resolveObjectVariables } from './variables';
import { resolveEnvVariables, resolveEnvInObject } from './environment';

/**
 * Builds a formatted cURL command for an endpoint and test case.
 */
export function buildCurlCommand(
  document: RCaseDocument,
  endpoint: EndpointDefinition,
  testCase: TestCaseDefinition,
  env: Record<string, string> = {}
): string {
  // Resolve environment and dynamic variables
  const resolvedBaseUrl = resolveBuiltinVariables(resolveEnvVariables(document.baseUrl, env));

  const resolvedCommonHeaders = document.headers
    ? (resolveObjectVariables(resolveEnvInObject(document.headers, env)) as Record<string, string>)
    : undefined;

  const resolvedEndpointHeaders = endpoint.headers
    ? (resolveObjectVariables(resolveEnvInObject(endpoint.headers, env)) as Record<string, string>)
    : undefined;

  const resolvedCaseHeaders = testCase.headers
    ? (resolveObjectVariables(resolveEnvInObject(testCase.headers, env)) as Record<string, string>)
    : undefined;

  const resolvedParams = testCase.params
    ? (resolveObjectVariables(resolveEnvInObject(testCase.params, env)) as Record<string, string | number | boolean>)
    : undefined;

  const resolvedQuery = testCase.query
    ? (resolveObjectVariables(resolveEnvInObject(testCase.query, env)) as Record<string, string | number | boolean>)
    : undefined;

  const resolvedBody = testCase.body !== undefined && testCase.body !== null
    ? resolveObjectVariables(resolveEnvInObject(testCase.body, env))
    : undefined;

  // Build target URL
  const urlResult = buildUrl(resolvedBaseUrl, endpoint.path, resolvedParams, resolvedQuery);
  const targetUrl = urlResult.url || `${resolvedBaseUrl}${endpoint.path}`;

  // Merge headers
  const mergedHeaders: Record<string, string> = {
    ...(resolvedCommonHeaders || {}),
    ...(resolvedEndpointHeaders || {}),
    ...(resolvedCaseHeaders || {})
  };

  let bodyString: string | undefined;
  if (resolvedBody !== undefined && resolvedBody !== null) {
    if (typeof resolvedBody === 'string') {
      bodyString = resolvedBody;
    } else {
      bodyString = JSON.stringify(resolvedBody);
      if (!Object.keys(mergedHeaders).some(k => k.toLowerCase() === 'content-type')) {
        mergedHeaders['Content-Type'] = 'application/json';
      }
    }
  }

  const parts: string[] = [];
  parts.push(`curl -X ${endpoint.method} "${targetUrl}"`);

  for (const [key, value] of Object.entries(mergedHeaders)) {
    // Escape double quotes inside header values
    const safeVal = String(value).replace(/"/g, '\\"');
    parts.push(`-H "${key}: ${safeVal}"`);
  }

  if (bodyString !== undefined) {
    const escapedBody = bodyString.replace(/'/g, "'\\''");
    parts.push(`-d '${escapedBody}'`);
  }

  return parts.join(' \\\n  ');
}
