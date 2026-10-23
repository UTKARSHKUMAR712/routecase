import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { redactHeaders, isSensitiveHeader, sanitizePreview } from '../../src/engine/redaction';

describe('RouteCase Security & Header Redaction', () => {
  it('20. should redact authorization, cookies, and api keys from logged headers', () => {
    const rawHeaders: Record<string, string> = {
      'Authorization': 'Bearer secret-token-xyz-123',
      'Cookie': 'session=abc987654',
      'x-api-key': 'super-secret-key-456',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Custom-Header': 'public-value'
    };

    const redacted = redactHeaders(rawHeaders);

    assert.equal(redacted['Authorization'], '[REDACTED]');
    assert.equal(redacted['Cookie'], '[REDACTED]');
    assert.equal(redacted['x-api-key'], '[REDACTED]');
    assert.equal(redacted['Content-Type'], 'application/json');
    assert.equal(redacted['Accept'], 'application/json');
    assert.equal(redacted['X-Custom-Header'], 'public-value');
  });

  it('should identify sensitive headers case-insensitively', () => {
    assert.equal(isSensitiveHeader('authorization'), true);
    assert.equal(isSensitiveHeader('AUTHORIZATION'), true);
    assert.equal(isSensitiveHeader('X-API-KEY'), true);
    assert.equal(isSensitiveHeader('content-type'), false);
    assert.equal(isSensitiveHeader('user-agent'), false);
  });

  it('should truncate oversized body previews safely', () => {
    const longString = 'A'.repeat(5000);
    const sanitized = sanitizePreview(longString, 100);
    assert.ok(sanitized.length < 500);
    assert.match(sanitized, /truncated 4900 bytes/);
  });
});
