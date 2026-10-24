import * as crypto from 'crypto';

const REALISTIC_NAMES: readonly string[] = [
  'Alice Smith',
  'Bob Jones',
  'Charlie Brown',
  'Diana Prince',
  'Evan Wright',
  'Fiona Gallagher',
  'George Clark',
  'Hannah Abbott'
];

/**
 * Resolves dynamic built-in variables like {{$uuid}}, {{$timestamp}}, {{$isoDate}},
 * {{$randomEmail}}, {{$randomInt}}, and {{$randomName}} inside a string.
 */
export function resolveBuiltinVariables(value: string): string {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/\{\{\$(uuid|timestamp|isoDate|randomEmail|randomInt|randomName)\}\}/g, (_, varName: string) => {
    switch (varName) {
      case 'uuid':
        return crypto.randomUUID();
      case 'timestamp':
        return Date.now().toString();
      case 'isoDate':
        return new Date().toISOString();
      case 'randomEmail': {
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `user_${Date.now()}_${rand}@routecase.test`;
      }
      case 'randomInt':
        return Math.floor(1000 + Math.random() * 9000).toString();
      case 'randomName': {
        const index = Math.floor(Math.random() * REALISTIC_NAMES.length);
        return REALISTIC_NAMES[index];
      }
      default:
        return `{{$${varName}}}`;
    }
  });
}

/**
 * Deeply traverses any JSON-compatible structure (object, array, primitive)
 * and resolves built-in variables in all string values and string keys.
 */
export function resolveObjectVariables(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return resolveBuiltinVariables(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveObjectVariables(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      const resolvedKey = resolveBuiltinVariables(key);
      result[resolvedKey] = resolveObjectVariables(val);
    }
    return result;
  }

  return obj;
}
