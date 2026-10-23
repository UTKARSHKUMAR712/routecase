import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { buildUrl, extractPlaceholders } from '../../src/engine/template';

describe('RouteCase Path Template Expansion', () => {
  it('9. should safely URL encode special characters and spaces in parameters', () => {
    const result = buildUrl('http://localhost:3000', '/api/search/{query}', {
      query: 'Batman & Robin / Gotham City ?'
    });
    assert.equal(result.success, true);
    assert.equal(
      result.url,
      'http://localhost:3000/api/search/Batman%20%26%20Robin%20%2F%20Gotham%20City%20%3F'
    );
  });

  it('10. should expand multiple placeholders in a single path template', () => {
    const result = buildUrl(
      'http://localhost:3000',
      '/orgs/{orgId}/repos/{repoName}/issues/{issueId}',
      {
        orgId: 'acme-corp',
        repoName: 'super-api',
        issueId: 42
      }
    );
    assert.equal(result.success, true);
    assert.equal(
      result.url,
      'http://localhost:3000/orgs/acme-corp/repos/super-api/issues/42'
    );
  });

  it('11. should detect and reject unresolved placeholders before network execution', () => {
    const result = buildUrl('http://localhost:3000', '/api/users/{userId}/posts/{postId}', {
      userId: 'user123'
      // postId is missing
    });
    assert.equal(result.success, false);
    assert.match(result.error || '', /Missing required path parameter/);
    assert.deepEqual(result.unresolvedPlaceholders, ['postId']);
  });

  it('should preserve URL path separators and handle trailing base slashes', () => {
    const res1 = buildUrl('http://localhost:3000/', '/api/v1/ping');
    assert.equal(res1.success, true);
    assert.equal(res1.url, 'http://localhost:3000/api/v1/ping');

    const res2 = buildUrl('http://localhost:3000/base', 'sub/{item}', { item: 'widget' });
    assert.equal(res2.success, true);
    assert.equal(res2.url, 'http://localhost:3000/base/sub/widget');
  });

  it('should correctly attach query string parameters with encoding', () => {
    const result = buildUrl(
      'http://localhost:3000',
      '/api/items',
      {},
      { sort: 'desc', limit: 20, filter: 'a & b' }
    );
    assert.equal(result.success, true);
    const parsed = new URL(result.url!);
    assert.equal(parsed.searchParams.get('sort'), 'desc');
    assert.equal(parsed.searchParams.get('limit'), '20');
    assert.equal(parsed.searchParams.get('filter'), 'a & b');
  });

  it('should extract placeholder names correctly', () => {
    const placeholders = extractPlaceholders('/users/{id}/details/{subId}');
    assert.deepEqual(placeholders, ['id', 'subId']);
  });
});
