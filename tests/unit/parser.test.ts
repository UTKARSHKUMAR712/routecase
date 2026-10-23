import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { parseRCase } from '../../src/parser/parser';

describe('RouteCase Parser & Schema Validation', () => {
  it('1. should successfully parse valid JSON matching the schema', () => {
    const content = JSON.stringify({
      baseUrl: 'http://localhost:3000',
      tests: [
        {
          name: 'Get user',
          method: 'GET',
          path: '/api/users/{id}',
          success: [
            {
              name: 'Valid user',
              params: { id: 1 },
              expect: { status: 200 }
            }
          ]
        }
      ]
    });

    const result = parseRCase(content);
    assert.equal(result.valid, true);
    assert.ok(result.document);
    assert.equal(result.document.baseUrl, 'http://localhost:3000');
    assert.equal(result.document.tests.length, 1);
    assert.equal(result.errors.length, 0);
  });

  it('2. should reject malformed JSON with descriptive syntax error', () => {
    const malformed = '{ baseUrl: "http://localhost:3000", tests: [ }';
    const result = parseRCase(malformed);
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
    assert.match(result.errors[0].message, /Malformed JSON/);
  });

  it('3. should reject missing required properties (baseUrl, tests)', () => {
    const missingBase = JSON.stringify({ tests: [] });
    const res1 = parseRCase(missingBase);
    assert.equal(res1.valid, false);
    assert.ok(res1.errors.some(e => e.path === 'baseUrl'));

    const missingTests = JSON.stringify({ baseUrl: 'http://localhost:3000' });
    const res2 = parseRCase(missingTests);
    assert.equal(res2.valid, false);
    assert.ok(res2.errors.some(e => e.path === 'tests'));
  });

  it('4. should support empty success and error arrays without failure', () => {
    const content = JSON.stringify({
      baseUrl: 'http://localhost:3000',
      tests: [
        {
          name: 'Health check',
          method: 'GET',
          path: '/health',
          success: [],
          errors: []
        }
      ]
    });
    const result = parseRCase(content);
    assert.equal(result.valid, true);
    assert.equal(result.document?.tests[0].success?.length, 0);
    assert.equal(result.document?.tests[0].errors?.length, 0);
  });

  it('5. should parse one success case', () => {
    const content = JSON.stringify({
      baseUrl: 'http://localhost:3000',
      tests: [
        {
          name: 'Ping',
          method: 'GET',
          path: '/ping',
          success: [
            {
              name: 'Normal ping',
              expect: { status: 200 }
            }
          ]
        }
      ]
    });
    const result = parseRCase(content);
    assert.equal(result.valid, true);
    assert.equal(result.document?.tests[0].success?.length, 1);
  });

  it('6. should parse multiple success cases', () => {
    const content = JSON.stringify({
      baseUrl: 'http://localhost:3000',
      tests: [
        {
          name: 'Get item',
          method: 'GET',
          path: '/items/{id}',
          success: [
            { name: 'Item 1', params: { id: 1 }, expect: { status: 200 } },
            { name: 'Item 2', params: { id: 2 }, expect: { status: 200 } },
            { name: 'Item 3', params: { id: 3 }, expect: { status: 200 } }
          ]
        }
      ]
    });
    const result = parseRCase(content);
    assert.equal(result.valid, true);
    assert.equal(result.document?.tests[0].success?.length, 3);
  });

  it('7. should parse multiple error cases', () => {
    const content = JSON.stringify({
      baseUrl: 'http://localhost:3000',
      tests: [
        {
          name: 'Get item errors',
          method: 'GET',
          path: '/items/{id}',
          errors: [
            { name: 'Not found', params: { id: 999 }, expect: { status: 404 } },
            { name: 'Forbidden', params: { id: -1 }, expect: { status: 403 } }
          ]
        }
      ]
    });
    const result = parseRCase(content);
    assert.equal(result.valid, true);
    assert.equal(result.document?.tests[0].errors?.length, 2);
  });

  it('8. should parse one endpoint with both success and error cases', () => {
    const content = JSON.stringify({
      baseUrl: 'http://localhost:3000',
      tests: [
        {
          name: 'Superhero',
          method: 'GET',
          path: '/superheroes/{name}',
          success: [
            { name: 'Batman', params: { name: 'Batman' }, expect: { status: 200, bodyContains: 'Batman' } }
          ],
          errors: [
            { name: 'Unknown', params: { name: 'Unknown123' }, expect: { status: 404 } },
            { name: 'Rat', params: { name: 'rat' }, expect: { status: 404 } },
            { name: 'King', params: { name: 'king' }, expect: { status: 404 } }
          ]
        }
      ]
    });
    const result = parseRCase(content);
    assert.equal(result.valid, true);
    assert.equal(result.document?.tests[0].success?.length, 1);
    assert.equal(result.document?.tests[0].errors?.length, 3);
  });

  it('should reject invalid HTTP methods and invalid status ranges', () => {
    const invalidMethod = JSON.stringify({
      baseUrl: 'http://localhost:3000',
      tests: [
        {
          name: 'Test',
          method: 'JUMP',
          path: '/test',
          success: [{ name: 'case', expect: { status: 999 } }]
        }
      ]
    });
    const result = parseRCase(invalidMethod);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.path.includes('method')));
    assert.ok(result.errors.some(e => e.path.includes('status')));
  });
});
