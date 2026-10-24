const http = require('http');
const path = require('path');
const fs = require('fs');
const app = require('./server');
const { TestExecutor } = require('../out/src/engine/executor');
const { parseRCase } = require('../out/src/parser/parser');

async function runFullSuite() {
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(4000, '127.0.0.1', () => {
      console.log('Test Express server started on http://127.0.0.1:4000');
      resolve();
    });
  });

  try {
    const suiteFilePath = path.join(__dirname, 'tests', 'full-suite.rcase');
    const content = fs.readFileSync(suiteFilePath, 'utf8');
    const parsed = parseRCase(content);

    if (!parsed.valid || !parsed.document) {
      console.error('Failed to parse suite:', parsed.errors);
      process.exitCode = 1;
      return;
    }

    const executor = new TestExecutor();
    console.log('\nExecuting full-suite.rcase against Express test server...\n');

    const result = await executor.executeSuite(parsed.document, suiteFilePath, {
      workspacePath: __dirname
    });

    console.log(`Suite: ${result.suiteName}`);
    console.log(`Total: ${result.totalCount} | Passed: ${result.passedCount} | Failed: ${result.failedCount} | Errors: ${result.errorCount}`);
    console.log(`Duration: ${result.durationMs}ms\n`);

    console.log('Individual Test Case Results:');
    result.results.forEach((r, idx) => {
      const icon = r.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} [${r.status}] [${r.method}] ${r.endpointName} -> ${r.caseName} (${r.durationMs}ms)`);
      console.log(`   URL: ${r.url}`);
      if (r.captured) {
        console.log(`   Captured:`, JSON.stringify(r.captured));
      }
      if (r.error) {
        console.log(`   Error: ${r.error}`);
      }
      if (r.assertions.length > 0) {
        r.assertions.forEach(a => {
          console.log(`   - ${a.passed ? '✓' : '✗'} ${a.message}`);
        });
      }
      console.log('');
    });

    if (result.failedCount > 0 || result.errorCount > 0) {
      process.exitCode = 1;
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
    console.log('Test Express server stopped.');
  }
}

runFullSuite().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
