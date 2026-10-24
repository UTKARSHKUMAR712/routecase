import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { buildCurlCommand } from '../../src/engine/curl';
import { RCaseDocument, EndpointDefinition, TestCaseDefinition } from '../../src/models/types';

describe('RouteCase cURL Generator', () => {
  it('should generate valid cURL for simple GET request', () => {
    const doc: RCaseDocument = {
      baseUrl: 'https://api.example.com',
      tests: []
    };
    const endpoint: EndpointDefinition = {
      name: 'Get Users',
      method: 'GET',
      path: '/api/users'
    };
    const testCase: TestCaseDefinition = {
      name: 'List all users',
      query: { page: 1, limit: 10 },
      expect: { status: 200 }
    };

    const curl = buildCurlCommand(doc, endpoint, testCase);
    assert.equal(
      curl,
      'curl -X GET "https://api.example.com/api/users?page=1&limit=10"'
    );
  });

  it('should generate cURL with path params, merged headers, and JSON body', () => {
    const doc: RCaseDocument = {
      baseUrl: 'https://api.example.com',
      headers: {
        'x-client-id': 'client_123'
      },
      tests: []
    };
    const endpoint: EndpointDefinition = {
      name: 'Create User',
      method: 'POST',
      path: '/api/orgs/{orgId}/users',
      headers: {
        Authorization: 'Bearer secret_token'
      }
    };
    const testCase: TestCaseDefinition = {
      name: 'Add user',
      params: { orgId: 'org_42' },
      body: { name: 'Alice', email: 'alice@example.com' },
      expect: { status: 201 }
    };

    const curl = buildCurlCommand(doc, endpoint, testCase);
    assert.ok(curl.startsWith('curl -X POST "https://api.example.com/api/orgs/org_42/users"'));
    assert.ok(curl.includes('-H "x-client-id: client_123"'));
    assert.ok(curl.includes('-H "Authorization: Bearer secret_token"'));
    assert.ok(curl.includes('-H "Content-Type: application/json"'));
    assert.ok(curl.includes(`-d '{"name":"Alice","email":"alice@example.com"}'`));
  });

  it('should resolve environment variables in generated cURL', () => {
    const doc: RCaseDocument = {
      baseUrl: '{{BASE_URL}}',
      tests: []
    };
    const endpoint: EndpointDefinition = {
      name: 'Test',
      method: 'GET',
      path: '/health'
    };
    const testCase: TestCaseDefinition = {
      name: 'Check',
      expect: { status: 200 }
    };

    const curl = buildCurlCommand(doc, endpoint, testCase, { BASE_URL: 'http://localhost:4000' });
    assert.equal(curl, 'curl -X GET "http://localhost:4000/health"');
  });
});
