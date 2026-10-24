import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { extractJsonPath, evaluateCapture } from '../../src/engine/capture';

describe('RouteCase Token Capture & Variable Chaining', () => {
  it('should extract top-level property', () => {
    const data = { accessToken: 'token_xyz_123', userId: 99 };
    assert.equal(extractJsonPath(data, 'accessToken'), 'token_xyz_123');
    assert.equal(extractJsonPath(data, 'userId'), 99);
  });

  it('should extract deeply nested property using dot-notation', () => {
    const data = {
      data: {
        auth: {
          token: 'nested_token_456'
        }
      }
    };
    assert.equal(extractJsonPath(data, 'data.auth.token'), 'nested_token_456');
  });

  it('should extract array elements using index notation', () => {
    const data = {
      users: [
        { id: 'user_1', name: 'Alice' },
        { id: 'user_2', name: 'Bob' }
      ]
    };
    assert.equal(extractJsonPath(data, 'users[0].id'), 'user_1');
    assert.equal(extractJsonPath(data, 'users.1.name'), 'Bob');
  });

  it('should return undefined for missing paths', () => {
    const data = { a: 1 };
    assert.equal(extractJsonPath(data, 'b.c.d'), undefined);
  });

  it('should evaluate capture directives and return stringified map', () => {
    const body = JSON.stringify({
      token: 'jwt_abc_789',
      user: { id: 101, admin: true }
    });

    const directives = {
      myToken: 'token',
      targetId: 'user.id',
      isAdmin: 'user.admin'
    };

    const captured = evaluateCapture(directives, body);
    assert.equal(captured.myToken, 'jwt_abc_789');
    assert.equal(captured.targetId, '101');
    assert.equal(captured.isAdmin, 'true');
  });

  it('should gracefully handle invalid non-JSON body', () => {
    const captured = evaluateCapture({ myToken: 'token' }, '<html>Not JSON</html>');
    assert.deepEqual(captured, {});
  });
});
