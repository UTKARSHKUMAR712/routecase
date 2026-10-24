import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadEnvironment,
  resolveEnvVariables,
  resolveEnvInObject
} from '../../src/engine/environment';

describe('RouteCase Environment Variables', () => {
  it('should substitute {{VAR_NAME}} from provided env map', () => {
    const env = { API_URL: 'http://localhost:4000', USER_ID: '42' };
    const str = '{{API_URL}}/users/{{USER_ID}}';
    assert.equal(resolveEnvVariables(str, env), 'http://localhost:4000/users/42');
  });

  it('should leave builtin variables {{$uuid}} untouched', () => {
    const env = { API_URL: 'http://localhost:4000' };
    const str = '{{API_URL}}/items/{{$uuid}}';
    assert.equal(resolveEnvVariables(str, env), 'http://localhost:4000/items/{{$uuid}}');
  });

  it('should leave undefined env variables untouched', () => {
    const env = { KNOWN: 'value' };
    const str = '{{KNOWN}}/{{UNKNOWN}}';
    assert.equal(resolveEnvVariables(str, env), 'value/{{UNKNOWN}}');
  });

  it('should recursively resolve env variables in objects and arrays', () => {
    const env = { HOST: 'example.com', TOKEN: 'secret-123' };
    const input = {
      url: 'https://{{HOST}}/api',
      headers: {
        Authorization: 'Bearer {{TOKEN}}'
      },
      list: ['{{HOST}}']
    };

    const resolved = resolveEnvInObject(input, env) as typeof input;
    assert.equal(resolved.url, 'https://example.com/api');
    assert.equal(resolved.headers.Authorization, 'Bearer secret-123');
    assert.equal(resolved.list[0], 'example.com');
  });

  it('should load environment from .rcase.env and .rcase.env.json and merge settings', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rcase-env-test-'));

    try {
      // Create .rcase.env
      fs.writeFileSync(
        path.join(tempDir, '.rcase.env'),
        '# Comment\nAPI_BASE=http://localhost:8080\nAPI_KEY="my-secret-key"\n'
      );

      // Create .rcase.env.json
      fs.writeFileSync(
        path.join(tempDir, '.rcase.env.json'),
        JSON.stringify({ API_VERSION: 'v2', PORT: 8080 })
      );

      const extra = { EXTRA_VAR: 'from-settings' };
      const env = loadEnvironment(tempDir, extra);

      assert.equal(env['API_BASE'], 'http://localhost:8080');
      assert.equal(env['API_KEY'], 'my-secret-key');
      assert.equal(env['API_VERSION'], 'v2');
      assert.equal(env['PORT'], '8080');
      assert.equal(env['EXTRA_VAR'], 'from-settings');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
