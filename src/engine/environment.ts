import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads environment variables from `.rcase.env`, `.rcase.env.json`, and merges with
 * provided settings-based environment variables.
 */
export function loadEnvironment(
  workspacePath?: string,
  extraEnv?: Record<string, string>
): Record<string, string> {
  const merged: Record<string, string> = {};

  if (workspacePath && fs.existsSync(workspacePath)) {
    // 1. Load .rcase.env (dotenv style)
    const dotenvPath = path.join(workspacePath, '.rcase.env');
    if (fs.existsSync(dotenvPath)) {
      try {
        const content = fs.readFileSync(dotenvPath, 'utf8');
        const parsedDotenv = parseDotenv(content);
        Object.assign(merged, parsedDotenv);
      } catch {
        // Silently skip malformed dotenv file
      }
    }

    // 2. Load .rcase.env.json
    const jsonEnvPath = path.join(workspacePath, '.rcase.env.json');
    if (fs.existsSync(jsonEnvPath)) {
      try {
        const content = fs.readFileSync(jsonEnvPath, 'utf8');
        const parsedJson = JSON.parse(content);
        if (typeof parsedJson === 'object' && parsedJson !== null && !Array.isArray(parsedJson)) {
          for (const [k, v] of Object.entries(parsedJson)) {
            merged[k] = typeof v === 'string' ? v : JSON.stringify(v);
          }
        }
      } catch {
        // Silently skip malformed json env file
      }
    }
  }

  // 3. Merge with extraEnv (e.g. from VS Code settings `routecase.env`)
  if (extraEnv && typeof extraEnv === 'object') {
    for (const [k, v] of Object.entries(extraEnv)) {
      merged[k] = String(v);
    }
  }

  return merged;
}

/**
 * Parses simple KEY=VALUE dotenv content.
 */
function parseDotenv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let val = trimmed.slice(eqIndex + 1).trim();

    // Strip surrounding quotes if present
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    if (key) {
      result[key] = val;
    }
  }

  return result;
}

/**
 * Replaces {{VAR_NAME}} placeholders where VAR_NAME does not start with '$'.
 * If the variable is defined in `env`, it is substituted; otherwise left intact.
 */
export function resolveEnvVariables(value: string, env: Record<string, string>): string {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/\{\{([^$#\s{}][^{}]*?)\}\}/g, (fullMatch, varName: string) => {
    const key = varName.trim();
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      return env[key];
    }
    return fullMatch;
  });
}

/**
 * Deeply traverses any JSON-compatible structure and resolves environment variables
 * in all string values and string keys.
 */
export function resolveEnvInObject(obj: unknown, env: Record<string, string>): unknown {
  if (typeof obj === 'string') {
    return resolveEnvVariables(obj, env);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveEnvInObject(item, env));
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      const resolvedKey = resolveEnvVariables(key, env);
      result[resolvedKey] = resolveEnvInObject(val, env);
    }
    return result;
  }

  return obj;
}
