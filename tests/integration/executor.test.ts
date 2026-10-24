import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as http from 'http';
import { AddressInfo } from 'net';
import { TestExecutor } from '../../src/engine/executor';
import { RCaseDocument } from '../../src/models/types';

describe('RouteCase Execution Engine Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);

      if (url.pathname === '/api/info/Batman') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ name: 'Batman', city: 'Gotham', universe: 'DC' }));
        return;
      }

      if (url.pathname === '/api/info/UnknownHero123' || url.pathname === '/api/info/rat' || url.pathname === '/api/info/king') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Hero not found' }));
        return;
      }

      if (url.pathname === '/api/search') {
        const name = url.searchParams.get('name');
        const gender = url.searchParams.get('gender');
        const publisher = url.searchParams.get('publisher');

        if (name === 'A-Bomb' && gender === 'Male' && publisher === 'Marvel Comics') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ found: true, name, gender, publisher }));
          return;
        }

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing or invalid search params' }));
        return;
      }

      if (url.pathname === '/slow') {
        // Delay response to test timeout
        setTimeout(() => {
          res.writeHead(200);
          res.end('finally');
        }, 1500);
        return;
      }

      if (url.pathname === '/large') {
        // Stream large response
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        const chunk = 'X'.repeat(1024 * 50); // 50KB
        for (let i = 0; i < 50; i++) {
          res.write(chunk);
        }
        res.end();
        return;
      }

      if (url.pathname === '/api/login' && req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accessToken: 'test-token-jwt-999', userId: 'user-77' }));
        return;
      }

      if (url.pathname === '/api/users/user-77' && req.method === 'GET') {
        const auth = req.headers['authorization'];
        if (auth === 'Bearer test-token-jwt-999') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id: 'user-77', status: 'authenticated' }));
          return;
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }
      }

      if (url.pathname === '/redirect-external') {
        res.writeHead(302, { 'Location': 'http://malicious-external-domain.test/leak' });
        res.end();
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', () => resolve());
    });

    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    await new Promise<void>(resolve => server.close(() => resolve()));
  });

  it('Regression Test: should correctly route query parameters in path template without %3F in route path', async () => {
    const doc: RCaseDocument = {
      baseUrl,
      tests: [
        {
          name: 'Search superheroes',
          method: 'GET',
          path: '/api/search?name={name}&gender={gender}&publisher={publisher}',
          success: [
            {
              name: 'Find A-Bomb',
              params: {
                name: 'A-Bomb',
                gender: 'Male',
                publisher: 'Marvel Comics'
              },
              expect: {
                status: 200,
                bodyContains: 'Marvel Comics'
              }
            }
          ]
        }
      ]
    };

    const executor = new TestExecutor();
    const suiteResult = await executor.executeSuite(doc, 'search.rcase');
    assert.equal(suiteResult.totalCount, 1);
    assert.equal(suiteResult.passedCount, 1);
    assert.equal(suiteResult.results[0].status, 'PASS');
    assert.equal(suiteResult.results[0].actualStatus, 200);
    assert.equal(
      suiteResult.results[0].url,
      `${baseUrl}/api/search?name=A-Bomb&gender=Male&publisher=Marvel%20Comics`
    );
  });

  it('should run full superhero suite (1 success, 3 errors) producing 4 independent results', async () => {
    const doc: RCaseDocument = {
      baseUrl,
      tests: [
        {
          name: 'Get superhero by name',
          method: 'GET',
          path: '/api/info/{name}',
          success: [
            {
              name: 'Find Batman',
              params: { name: 'Batman' },
              expect: { status: 200, bodyContains: 'Batman' }
            }
          ],
          errors: [
            {
              name: 'Unknown superhero',
              params: { name: 'UnknownHero123' },
              expect: { status: 404 }
            },
            {
              name: 'Invalid name rat',
              params: { name: 'rat' },
              expect: { status: 404 }
            },
            {
              name: 'Invalid name king',
              params: { name: 'king' },
              expect: { status: 404 }
            }
          ]
        }
      ]
    };

    const executor = new TestExecutor();
    const suiteResult = await executor.executeSuite(doc, 'test.rcase');

    assert.equal(suiteResult.totalCount, 4);
    assert.equal(suiteResult.passedCount, 4);
    assert.equal(suiteResult.failedCount, 0);
    assert.equal(suiteResult.errorCount, 0);

    assert.equal(suiteResult.results[0].status, 'PASS');
    assert.equal(suiteResult.results[1].status, 'PASS');
    assert.equal(suiteResult.results[2].status, 'PASS');
    assert.equal(suiteResult.results[3].status, 'PASS');
  });

  it('16. should report status ERROR when server is unavailable', async () => {
    // Port 59999 has no listener
    const doc: RCaseDocument = {
      baseUrl: 'http://127.0.0.1:59999',
      tests: [
        {
          name: 'Dead endpoint',
          method: 'GET',
          path: '/ping',
          success: [{ name: 'Expect 200', expect: { status: 200 } }]
        }
      ]
    };

    const executor = new TestExecutor();
    const suiteResult = await executor.executeSuite(doc, 'test.rcase', { timeoutMs: 500 });

    assert.equal(suiteResult.totalCount, 1);
    assert.equal(suiteResult.results[0].status, 'ERROR');
    assert.match(suiteResult.results[0].error || '', /Connection refused/);
  });

  it('17. should report status ERROR when request exceeds configured timeout', async () => {
    const doc: RCaseDocument = {
      baseUrl,
      tests: [
        {
          name: 'Slow endpoint',
          method: 'GET',
          path: '/slow',
          success: [{ name: 'Expect quick reply', expect: { status: 200 } }]
        }
      ]
    };

    const executor = new TestExecutor();
    const suiteResult = await executor.executeSuite(doc, 'test.rcase', { timeoutMs: 200 });

    assert.equal(suiteResult.results[0].status, 'ERROR');
    assert.match(suiteResult.results[0].error || '', /timed out/i);
  });

  it('18. should cancel remaining cases when aborted', async () => {
    const doc: RCaseDocument = {
      baseUrl,
      tests: [
        {
          name: 'Batch endpoints',
          method: 'GET',
          path: '/api/info/{name}',
          success: [
            { name: 'Case 1', params: { name: 'Batman' }, expect: { status: 200 } },
            { name: 'Case 2', params: { name: 'Batman' }, expect: { status: 200 } },
            { name: 'Case 3', params: { name: 'Batman' }, expect: { status: 200 } }
          ]
        }
      ]
    };

    const executor = new TestExecutor();
    const controller = new AbortController();

    // Abort after first case
    const options = {
      signal: controller.signal,
      onCaseComplete: () => {
        controller.abort();
      }
    };

    const suiteResult = await executor.executeSuite(doc, 'test.rcase', options);
    assert.equal(suiteResult.totalCount, 3);
    assert.equal(suiteResult.results[0].status, 'PASS');
    assert.equal(suiteResult.results[1].status, 'CANCELLED');
    assert.equal(suiteResult.results[2].status, 'CANCELLED');
  });

  it('19. should continue running subsequent cases after a case fails assertion', async () => {
    const doc: RCaseDocument = {
      baseUrl,
      tests: [
        {
          name: 'Multiple cases',
          method: 'GET',
          path: '/api/info/{name}',
          success: [
            { name: 'Failing case', params: { name: 'Batman' }, expect: { status: 500 } }, // actual is 200 -> FAIL
            { name: 'Passing case', params: { name: 'Batman' }, expect: { status: 200 } }  // actual is 200 -> PASS
          ]
        }
      ]
    };

    const executor = new TestExecutor();
    const suiteResult = await executor.executeSuite(doc, 'test.rcase');

    assert.equal(suiteResult.totalCount, 2);
    assert.equal(suiteResult.results[0].status, 'FAIL');
    assert.equal(suiteResult.results[1].status, 'PASS');
    assert.equal(suiteResult.failedCount, 1);
    assert.equal(suiteResult.passedCount, 1);
  });

  it('21. should reject unsafe cross-origin redirects', async () => {
    const doc: RCaseDocument = {
      baseUrl,
      tests: [
        {
          name: 'External Redirect',
          method: 'GET',
          path: '/redirect-external',
          success: [{ name: 'Expect redirect safety', expect: { status: 200 } }]
        }
      ]
    };

    const executor = new TestExecutor();
    const suiteResult = await executor.executeSuite(doc, 'test.rcase', { followRedirects: true });
    assert.equal(suiteResult.results[0].status, 'ERROR');
    assert.match(suiteResult.results[0].error || '', /Cross-origin redirect/);
  });

  it('22. should reject oversized response exceeding maxResponseSizeBytes', async () => {
    const doc: RCaseDocument = {
      baseUrl,
      tests: [
        {
          name: 'Large response',
          method: 'GET',
          path: '/large',
          success: [{ name: 'Expect 200', expect: { status: 200 } }]
        }
      ]
    };

    const executor = new TestExecutor();
    const suiteResult = await executor.executeSuite(doc, 'test.rcase', { maxResponseSizeBytes: 10 * 1024 }); // 10KB limit

    assert.equal(suiteResult.results[0].status, 'ERROR');
    assert.match(suiteResult.results[0].error || '', /maximum size limit/);
  });

  it('should support token capture and variable chaining across cases', async () => {
    const doc: RCaseDocument = {
      baseUrl: '{{BASE_URL}}',
      tests: [
        {
          name: 'Auth flow',
          method: 'POST',
          path: '/api/login',
          success: [
            {
              name: 'Login',
              capture: {
                savedToken: 'accessToken',
                savedUser: 'userId'
              },
              expect: { status: 200 }
            }
          ]
        },
        {
          name: 'Protected user profile',
          method: 'GET',
          path: '/api/users/{id}',
          success: [
            {
              name: 'Fetch profile with captured token',
              params: { id: '{{savedUser}}' },
              headers: { Authorization: 'Bearer {{savedToken}}' },
              expect: { status: 200, bodyContains: 'authenticated' }
            }
          ]
        }
      ]
    };

    const executor = new TestExecutor();
    const suiteResult = await executor.executeSuite(doc, 'chain-test.rcase', {
      env: { BASE_URL: baseUrl }
    });

    assert.equal(suiteResult.totalCount, 2);
    assert.equal(suiteResult.passedCount, 2);
    assert.equal(suiteResult.failedCount, 0);
    assert.equal(suiteResult.results[0].status, 'PASS');
    assert.equal(suiteResult.results[0].captured?.savedToken, 'test-token-jwt-999');
    assert.equal(suiteResult.results[0].captured?.savedUser, 'user-77');
    assert.equal(suiteResult.results[1].status, 'PASS');
  });
});