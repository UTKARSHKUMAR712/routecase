import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { escapeHtml } from '../../src/webview/escape';

describe('RouteCase Webview Security & Content Escaping', () => {
  it('23. should escape HTML entities to prevent XSS in webview rendering', () => {
    const malicious = '<script>alert("XSS")</script><img src="x" onerror="evil()">&';
    const escaped = escapeHtml(malicious);

    assert.equal(escaped.includes('<script>'), false);
    assert.equal(escaped.includes('&lt;script&gt;'), true);
    assert.equal(escaped.includes('&lt;img'), true);
    assert.equal(escaped.includes('&amp;'), true);
    assert.equal(escaped.includes('&quot;XSS&quot;'), true);
  });

  it('24. regression: should handle null, undefined, numbers, and objects without crashing', () => {
    assert.equal(escapeHtml(null), '');
    assert.equal(escapeHtml(undefined), '');
    assert.equal(escapeHtml(12345), '12345');
    assert.equal(escapeHtml(true), 'true');

    const obj = { alert: '<test>' };
    const escapedObj = escapeHtml(obj);
    assert.equal(escapedObj.includes('&lt;test&gt;'), true);
  });
});
