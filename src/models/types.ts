export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface TestCaseExpectation {
  status: number;
  bodyContains?: string;
  bodyEquals?: unknown;
  headers?: Record<string, string>;
  maxDurationMs?: number;
}

export interface TestCaseDefinition {
  name: string;
  description?: string;
  params?: Record<string, string | number | boolean>;
  query?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  body?: unknown;
  expect: TestCaseExpectation;
}

export interface EndpointDefinition {
  name: string;
  method: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  success?: TestCaseDefinition[];
  errors?: TestCaseDefinition[];
}

export interface RCaseDocument {
  $schema?: string;
  name?: string;
  baseUrl: string;
  headers?: Record<string, string>;
  tests: EndpointDefinition[];
}

export type TestStatus = 'PASS' | 'FAIL' | 'ERROR' | 'RUNNING' | 'PENDING' | 'CANCELLED';

export interface AssertionResult {
  type: 'status' | 'bodyContains' | 'bodyEquals' | 'header' | 'duration';
  passed: boolean;
  expected: unknown;
  actual: unknown;
  message: string;
}

export interface ExecutedTestCase {
  id: string;
  endpointName: string;
  caseName: string;
  caseKind: 'success' | 'error';
  method: HttpMethod;
  url: string;
  redactedHeaders: Record<string, string>;
  requestBody?: unknown;
  status: TestStatus;
  actualStatus?: number;
  actualHeaders?: Record<string, string>;
  actualBody?: string;
  durationMs: number;
  assertions: AssertionResult[];
  error?: string;
  timestamp: number;
}

export interface TestSuiteResult {
  filePath: string;
  suiteName: string;
  totalCount: number;
  passedCount: number;
  failedCount: number;
  errorCount: number;
  durationMs: number;
  results: ExecutedTestCase[];
}

export interface ExecutionOptions {
  timeoutMs?: number;
  maxResponseSizeBytes?: number;
  followRedirects?: boolean;
  signal?: AbortSignal;
  onCaseStart?: (testCase: { id: string; endpointName: string; caseName: string }) => void;
  onCaseComplete?: (result: ExecutedTestCase) => void;
}
