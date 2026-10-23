import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { buildUrl, extractPlaceholders } from '../../src/engine/template';

describe('RouteCase Path Template Expansion', () => {
  it('Regression Test 1: Path parameter should substitute cleanly into pathname', () => {
    const result = buildUrl('http://localhost:3000', '/api/info/{name}', {
      name: 'A-Bomb'
    });
    assert.equal(result.success, true);
    assert.equal(result.url, 'http://localhost:3000/api/info/A-Bomb');
    const parsed = new URL(result.url!);
    assert.equal(parsed.pathname, '/api/info/A-Bomb');
    assert.equal(parsed.search, '');
  });

  it('Regression Test 2: Query parameters in pathTemplate should preserve literal ? and & without %3F', () => {
    const result = buildUrl(
      'http://localhost:3000',
      '/api/search?name={name}&gender={gender}&publisher={publisher}',
      {
        name: 'A-Bomb',
        gender: 'Male',
        publisher: 'Marvel Comics'
      }
    );
    assert.equal(result.success, true);
    assert.equal(
      result.url,
      'http://localhost:3000/api/search?name=A-Bomb&gender=Male&publisher=Marvel%20Comics'
    );
    const parsed = new URL(result.url!);
    assert.equal(parsed.pathname, '/api/search');
    assert.equal(parsed.searchParams.get('name'), 'A-Bomb');
    assert.equal(parsed.searchParams.get('gender'), 'Male');
    assert.equal(parsed.searchParams.get('publisher'), 'Marvel Comics');
  });

  it('Regression Test 3: Multiple special characters (&, +, %, ?, spaces, Unicode) must not alter query structure', () => {
    const specialVal = 'Batman & Robin + Catwoman % 100% Café 🦇 ?';
    const result = buildUrl('http://localhost:3000', '/api/search?query={query}&lang={lang}', {
      query: specialVal,
      lang: 'en'
    });
    assert.equal(result.success, true);
    assert.ok(result.url);
    assert.equal(result.url.includes('%3F'), true); // encoded ? inside parameter value
    assert.equal(result.url.startsWith('http://localhost:3000/api/search?'), true); // literal ? after pathname

    const parsed = new URL(result.url);
    assert.equal(parsed.pathname, '/api/search');
    // Express / WHATWG URL decodes parameter values exactly back to the original
    assert.equal(parsed.searchParams.get('query'), specialVal);
    assert.equal(parsed.searchParams.get('lang'), 'en');
    // Ensure the query structure only has 2 keys ('query' and 'lang')
    assert.equal(Array.from(parsed.searchParams.keys()).length, 2);
  });

  it('Regression Test 4: Should support both path parameters and query parameters in one definition', () => {
    const result = buildUrl(
      'http://localhost:3000',
      '/api/users/{userId}/posts?filter={filter}&limit={limit}',
      {
        userId: 'user_42',
        filter: 'draft & published',
        limit: 25
      }
    );
    assert.equal(result.success, true);
    assert.equal(
      result.url,
      'http://localhost:3000/api/users/user_42/posts?filter=draft%20%26%20published&limit=25'
    );
    const parsed = new URL(result.url!);
    assert.equal(parsed.pathname, '/api/users/user_42/posts');
    assert.equal(parsed.searchParams.get('filter'), 'draft & published');
    assert.equal(parsed.searchParams.get('limit'), '25');
  });

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
    const placeholders = extractPlaceholders('/users/{id}/details/{subId}?filter={filterName}');
    assert.deepEqual(placeholders, ['id', 'subId', 'filterName']);
  });
});
