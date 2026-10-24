/**
 * Extracts a value from a nested JSON-compatible object using a dot-notation path.
 * Supports property access like "data.auth.token" and bracket index access like "items[0].id" or "items.0.id".
 */
export function extractJsonPath(data: unknown, path: string): unknown {
  if (!path || data === undefined || data === null) {
    return undefined;
  }

  const normalized = path.replace(/\[(\w+)\]/g, '.$1');
  const segments = normalized.split('.').filter(s => s.length > 0);

  let current: any = data;
  for (const segment of segments) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[segment];
  }

  return current;
}

/**
 * Evaluates capture directives against a response body.
 * Returns an object of newly captured variable names and string values.
 */
export function evaluateCapture(
  captureDirectives: Record<string, string>,
  responseBody: string
): Record<string, string> {
  const captured: Record<string, string> = {};

  if (!captureDirectives || typeof captureDirectives !== 'object') {
    return captured;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseBody);
  } catch {
    // If response body is not JSON, we cannot extract dot-notation properties
    return captured;
  }

  for (const [varName, jsonPath] of Object.entries(captureDirectives)) {
    const extracted = extractJsonPath(parsed, jsonPath);
    if (extracted !== undefined) {
      captured[varName] = typeof extracted === 'object' && extracted !== null
        ? JSON.stringify(extracted)
        : String(extracted);
    }
  }

  return captured;
}
