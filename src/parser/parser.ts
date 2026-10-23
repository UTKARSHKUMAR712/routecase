import { RCaseDocument, HttpMethod } from '../models/types';

export interface ValidationError {
  path: string;
  message: string;
}

export interface ParseResult {
  valid: boolean;
  document?: RCaseDocument;
  errors: ValidationError[];
}

const ALLOWED_METHODS: ReadonlySet<string> = new Set<HttpMethod>([
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'
]);

export function parseRCase(content: string): ParseResult {
  const errors: ValidationError[] = [];

  if (!content || !content.trim()) {
    return {
      valid: false,
      errors: [{ path: '$', message: 'Test file is empty' }]
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      errors: [{ path: '$', message: `Malformed JSON: ${message}` }]
    };
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {
      valid: false,
      errors: [{ path: '$', message: 'Root of .rcase file must be a JSON object' }]
    };
  }

  const obj = raw as Record<string, unknown>;

  // Validate baseUrl
  if (typeof obj.baseUrl !== 'string' || !obj.baseUrl.trim()) {
    errors.push({ path: 'baseUrl', message: 'Missing or invalid "baseUrl". Must be a non-empty string URL.' });
  } else {
    try {
      const parsedUrl = new URL(obj.baseUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        errors.push({ path: 'baseUrl', message: `Unsupported protocol "${parsedUrl.protocol}". Only http: and https: are supported.` });
      }
    } catch {
      errors.push({ path: 'baseUrl', message: `Invalid "baseUrl" format: "${obj.baseUrl}". Must be a valid absolute URL.` });
    }
  }

  // Validate optional headers
  if (obj.headers !== undefined) {
    if (typeof obj.headers !== 'object' || obj.headers === null || Array.isArray(obj.headers)) {
      errors.push({ path: 'headers', message: '"headers" must be a JSON object of key-value pairs.' });
    }
  }

  // Validate tests
  if (!Array.isArray(obj.tests)) {
    errors.push({ path: 'tests', message: 'Missing or invalid "tests". Must be an array of endpoint definitions.' });
  } else {
    obj.tests.forEach((endpointRaw, endpointIndex) => {
      validateEndpoint(endpointRaw, `tests[${endpointIndex}]`, errors);
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    document: raw as RCaseDocument,
    errors: []
  };
}

function validateEndpoint(raw: unknown, path: string, errors: ValidationError[]): void {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    errors.push({ path, message: 'Endpoint definition must be an object.' });
    return;
  }

  const ep = raw as Record<string, unknown>;

  if (typeof ep.name !== 'string' || !ep.name.trim()) {
    errors.push({ path: `${path}.name`, message: 'Endpoint requires a non-empty "name".' });
  }

  if (typeof ep.method !== 'string' || !ALLOWED_METHODS.has(ep.method.toUpperCase() as HttpMethod)) {
    errors.push({
      path: `${path}.method`,
      message: `Invalid or missing HTTP "method". Must be one of: ${Array.from(ALLOWED_METHODS).join(', ')}.`
    });
  }

  if (typeof ep.path !== 'string') {
    errors.push({ path: `${path}.path`, message: 'Endpoint requires a "path" string template (e.g. "/api/items/{id}").' });
  }

  if (ep.headers !== undefined) {
    if (typeof ep.headers !== 'object' || ep.headers === null || Array.isArray(ep.headers)) {
      errors.push({ path: `${path}.headers`, message: 'Endpoint "headers" must be a JSON object.' });
    }
  }

  if (ep.success !== undefined) {
    if (!Array.isArray(ep.success)) {
      errors.push({ path: `${path}.success`, message: '"success" must be an array of test cases.' });
    } else {
      ep.success.forEach((caseRaw, caseIndex) => {
        validateTestCase(caseRaw, `${path}.success[${caseIndex}]`, errors);
      });
    }
  }

  if (ep.errors !== undefined) {
    if (!Array.isArray(ep.errors)) {
      errors.push({ path: `${path}.errors`, message: '"errors" must be an array of test cases.' });
    } else {
      ep.errors.forEach((caseRaw, caseIndex) => {
        validateTestCase(caseRaw, `${path}.errors[${caseIndex}]`, errors);
      });
    }
  }
}

function validateTestCase(raw: unknown, path: string, errors: ValidationError[]): void {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    errors.push({ path, message: 'Test case must be an object.' });
    return;
  }

  const tc = raw as Record<string, unknown>;

  if (typeof tc.name !== 'string' || !tc.name.trim()) {
    errors.push({ path: `${path}.name`, message: 'Test case requires a non-empty "name".' });
  }

  if (tc.params !== undefined) {
    if (typeof tc.params !== 'object' || tc.params === null || Array.isArray(tc.params)) {
      errors.push({ path: `${path}.params`, message: '"params" must be an object mapping placeholder names to values.' });
    }
  }

  if (tc.query !== undefined) {
    if (typeof tc.query !== 'object' || tc.query === null || Array.isArray(tc.query)) {
      errors.push({ path: `${path}.query`, message: '"query" must be an object mapping query keys to values.' });
    }
  }

  if (tc.headers !== undefined) {
    if (typeof tc.headers !== 'object' || tc.headers === null || Array.isArray(tc.headers)) {
      errors.push({ path: `${path}.headers`, message: '"headers" must be an object.' });
    }
  }

  if (typeof tc.expect !== 'object' || tc.expect === null || Array.isArray(tc.expect)) {
    errors.push({ path: `${path}.expect`, message: 'Test case requires an "expect" object.' });
  } else {
    const exp = tc.expect as Record<string, unknown>;
    if (typeof exp.status !== 'number' || !Number.isInteger(exp.status) || exp.status < 100 || exp.status > 599) {
      errors.push({
        path: `${path}.expect.status`,
        message: 'Missing or invalid "expect.status". Must be an integer HTTP status code between 100 and 599.'
      });
    }

    if (exp.bodyContains !== undefined && typeof exp.bodyContains !== 'string') {
      errors.push({ path: `${path}.expect.bodyContains`, message: '"bodyContains" must be a string.' });
    }

    if (exp.maxDurationMs !== undefined) {
      if (typeof exp.maxDurationMs !== 'number' || exp.maxDurationMs <= 0) {
        errors.push({ path: `${path}.expect.maxDurationMs`, message: '"maxDurationMs" must be a positive number.' });
      }
    }
  }
}
