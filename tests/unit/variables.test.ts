import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { resolveBuiltinVariables, resolveObjectVariables } from '../../src/engine/variables';

describe('RouteCase Dynamic Builtin Variables', () => {
  it('should resolve {{$uuid}} into a valid UUID string', () => {
    const resolved = resolveBuiltinVariables('item_{{$uuid}}');
    assert.match(resolved, /^item_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('should resolve {{$timestamp}} into an epoch ms number string', () => {
    const before = Date.now();
    const resolved = resolveBuiltinVariables('{{$timestamp}}');
    const ts = parseInt(resolved, 10);
    const after = Date.now();
    assert.ok(!isNaN(ts));
    assert.ok(ts >= before && ts <= after);
  });

  it('should resolve {{$isoDate}} into a valid ISO date string', () => {
    const resolved = resolveBuiltinVariables('{{$isoDate}}');
    assert.match(resolved, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should resolve {{$randomEmail}} into a valid email', () => {
    const resolved = resolveBuiltinVariables('{{$randomEmail}}');
    assert.match(resolved, /^user_\d+_\d+@routecase\.test$/);
  });

  it('should resolve {{$randomInt}} into a number between 1000 and 9999', () => {
    const resolved = resolveBuiltinVariables('{{$randomInt}}');
    const num = parseInt(resolved, 10);
    assert.ok(num >= 1000 && num <= 9999);
  });

  it('should resolve {{$randomName}} to a realistic non-empty name', () => {
    const resolved = resolveBuiltinVariables('{{$randomName}}');
    assert.ok(resolved.length > 3);
    assert.match(resolved, /^[A-Z][a-z]+ [A-Z][a-z]+/);
  });

  it('should recursively resolve variables across objects, arrays, and nested structures', () => {
    const input = {
      user: {
        id: 'usr_{{$uuid}}',
        email: '{{$randomEmail}}',
        tags: ['verified', 'user-{{$randomInt}}']
      },
      count: 42,
      active: true,
      notes: null
    };

    const result = resolveObjectVariables(input) as typeof input;
    assert.match(result.user.id, /^usr_[0-9a-f-]+$/);
    assert.match(result.user.email, /^user_.*@routecase\.test$/);
    assert.match(result.user.tags[1], /^user-\d{4}$/);
    assert.equal(result.count, 42);
    assert.equal(result.active, true);
    assert.equal(result.notes, null);
  });
});
