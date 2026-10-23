import { AssertionResult, TestCaseExpectation } from '../models/types';

export function evaluateAssertions(
  expect: TestCaseExpectation,
  actualStatus: number,
  actualBody: string,
  actualHeaders: Record<string, string>,
  durationMs: number
): { passed: boolean; assertions: AssertionResult[] } {
  const assertions: AssertionResult[] = [];
  let allPassed = true;

  // 1. Status Code assertion
  const statusPassed = actualStatus === expect.status;
  assertions.push({
    type: 'status',
    passed: statusPassed,
    expected: expect.status,
    actual: actualStatus,
    message: statusPassed
      ? `HTTP status ${actualStatus} matches expected ${expect.status}`
      : `Expected HTTP status ${expect.status}, but received ${actualStatus}`
  });
  if (!statusPassed) {
    allPassed = false;
  }

  // 2. bodyContains assertion (optional)
  if (expect.bodyContains !== undefined) {
    const containsPassed = actualBody.includes(expect.bodyContains);
    assertions.push({
      type: 'bodyContains',
      passed: containsPassed,
      expected: expect.bodyContains,
      actual: actualBody.length > 300 ? actualBody.substring(0, 300) + '...' : actualBody,
      message: containsPassed
        ? `Response body contains "${expect.bodyContains}"`
        : `Expected response body to contain "${expect.bodyContains}"`
    });
    if (!containsPassed) {
      allPassed = false;
    }
  }

  // 3. bodyEquals assertion (optional)
  if (expect.bodyEquals !== undefined) {
    let equalsPassed = false;
    let expectedFormatted: string;

    if (typeof expect.bodyEquals === 'object' && expect.bodyEquals !== null) {
      expectedFormatted = JSON.stringify(expect.bodyEquals);
      try {
        const parsedActual = JSON.parse(actualBody);
        equalsPassed = JSON.stringify(parsedActual) === JSON.stringify(expect.bodyEquals);
      } catch {
        equalsPassed = false;
      }
    } else {
      expectedFormatted = String(expect.bodyEquals);
      equalsPassed = actualBody.trim() === expectedFormatted.trim();
    }

    assertions.push({
      type: 'bodyEquals',
      passed: equalsPassed,
      expected: expectedFormatted,
      actual: actualBody.length > 300 ? actualBody.substring(0, 300) + '...' : actualBody,
      message: equalsPassed
        ? 'Response body matches expected content'
        : 'Response body does not match expected content'
    });
    if (!equalsPassed) {
      allPassed = false;
    }
  }

  // 4. Expected headers (optional)
  if (expect.headers) {
    const normalizedActualHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(actualHeaders)) {
      normalizedActualHeaders[key.toLowerCase()] = value;
    }

    for (const [expKey, expVal] of Object.entries(expect.headers)) {
      const actualVal = normalizedActualHeaders[expKey.toLowerCase()];
      const headerPassed = actualVal !== undefined && actualVal.includes(expVal);
      assertions.push({
        type: 'header',
        passed: headerPassed,
        expected: `${expKey}: ${expVal}`,
        actual: actualVal ? `${expKey}: ${actualVal}` : `${expKey}: (missing)`,
        message: headerPassed
          ? `Header "${expKey}" matches expected value`
          : `Expected header "${expKey}" with value "${expVal}", got "${actualVal ?? 'undefined'}"`
      });
      if (!headerPassed) {
        allPassed = false;
      }
    }
  }

  // 5. maxDurationMs assertion (optional)
  if (expect.maxDurationMs !== undefined) {
    const durationPassed = durationMs <= expect.maxDurationMs;
    assertions.push({
      type: 'duration',
      passed: durationPassed,
      expected: `<= ${expect.maxDurationMs}ms`,
      actual: `${durationMs}ms`,
      message: durationPassed
        ? `Response time ${durationMs}ms is within limit of ${expect.maxDurationMs}ms`
        : `Response time ${durationMs}ms exceeded maximum allowed duration of ${expect.maxDurationMs}ms`
    });
    if (!durationPassed) {
      allPassed = false;
    }
  }

  return { passed: allPassed, assertions };
}
