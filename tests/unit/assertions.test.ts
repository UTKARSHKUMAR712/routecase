import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { evaluateAssertions } from '../../src/engine/assertions';

describe('RouteCase Assertion Engine', () => {
  it('12. should pass matching status assertions (e.g. 200 == 200, or 404 == 404)', () => {
    const successRes = evaluateAssertions({ status: 200 }, 200, 'OK', {}, 45);
    assert.equal(successRes.passed, true);
    assert.equal(successRes.assertions[0].passed, true);

    const errorExpectedRes = evaluateAssertions({ status: 404 }, 404, 'Not Found', {}, 30);
    assert.equal(errorExpectedRes.passed, true);
    assert.equal(errorExpectedRes.assertions[0].passed, true);
  });

  it('13. should fail mismatched status assertions (e.g. expected 200 got 500, expected 404 got 200)', () => {
    const failRes1 = evaluateAssertions({ status: 200 }, 500, 'Server Error', {}, 120);
    assert.equal(failRes1.passed, false);
    assert.equal(failRes1.assertions[0].passed, false);

    const failRes2 = evaluateAssertions({ status: 404 }, 200, '{"id": 1}', {}, 25);
    assert.equal(failRes2.passed, false);
    assert.equal(failRes2.assertions[0].passed, false);
  });

  it('14. should pass matching bodyContains assertion', () => {
    const res = evaluateAssertions(
      { status: 200, bodyContains: 'Batman' },
      200,
      '{"hero": "Batman", "city": "Gotham"}',
      {},
      50
    );
    assert.equal(res.passed, true);
    assert.equal(res.assertions.length, 2);
    assert.equal(res.assertions[1].passed, true);
  });

  it('15. should fail mismatched bodyContains assertion', () => {
    const res = evaluateAssertions(
      { status: 200, bodyContains: 'Superman' },
      200,
      '{"hero": "Batman", "city": "Gotham"}',
      {},
      50
    );
    assert.equal(res.passed, false);
    assert.equal(res.assertions[0].passed, true); // status passed
    assert.equal(res.assertions[1].passed, false); // body failed
  });

  it('should evaluate bodyEquals with structured JSON comparison', () => {
    const res = evaluateAssertions(
      { status: 200, bodyEquals: { active: true, count: 5 } },
      200,
      JSON.stringify({ active: true, count: 5 }),
      {},
      10
    );
    assert.equal(res.passed, true);
  });

  it('should evaluate duration threshold assertions', () => {
    const pass = evaluateAssertions({ status: 200, maxDurationMs: 500 }, 200, '', {}, 120);
    assert.equal(pass.passed, true);

    const fail = evaluateAssertions({ status: 200, maxDurationMs: 100 }, 200, '', {}, 250);
    assert.equal(fail.passed, false);
    assert.ok(fail.assertions.some(a => a.type === 'duration' && !a.passed));
  });
});
