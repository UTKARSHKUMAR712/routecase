import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { TestExecutor } from '../../src/engine/executor';
import { parseRCase } from '../../src/parser/parser';

describe('RouteCase Full Suite Integration with Express Test Server', () => {
  let server: http.Server;

  before(async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require(path.join(process.cwd(), 'test-server', 'server'));
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(4000, '127.0.0.1', () => resolve());
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('should execute full-suite.rcase against Express server with 100% pass rate', async () => {
    const testServerDir = path.join(process.cwd(), 'test-server');
    const suiteFilePath = path.join(testServerDir, 'tests', 'full-suite.rcase');
    const content = fs.readFileSync(suiteFilePath, 'utf8');
    const parsed = parseRCase(content);

    assert.equal(parsed.valid, true, `Validation failed: ${JSON.stringify(parsed.errors)}`);
    assert.ok(parsed.document);

    const executor = new TestExecutor();
    const suiteResult = await executor.executeSuite(parsed.document, suiteFilePath, {
      workspacePath: testServerDir
    });

    assert.equal(suiteResult.totalCount, 10);
    assert.equal(suiteResult.passedCount, 10);
    assert.equal(suiteResult.failedCount, 0);
    assert.equal(suiteResult.errorCount, 0);

    // Verify token capture
    const loginCase = suiteResult.results.find(r => r.caseName.includes('capture access token'));
    assert.ok(loginCase);
    assert.equal(loginCase.status, 'PASS');
    assert.equal(loginCase.captured?.authToken, 'jwt_sample_token_xyz_987654321');
    assert.equal(loginCase.captured?.authUserId, 'usr_42');

    // Verify user ID chaining
    const userCase = suiteResult.results.find(r => r.caseName.includes('Fetch captured user ID'));
    assert.ok(userCase);
    assert.equal(userCase.status, 'PASS');
    assert.equal(userCase.url, 'http://localhost:4000/users/usr_42');
  });
});
