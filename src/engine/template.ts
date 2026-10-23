export interface ExpansionResult {
  success: boolean;
  url?: string;
  error?: string;
  unresolvedPlaceholders?: string[];
}

const PLACEHOLDER_REGEX = /\{([a-zA-Z0-9_-]+)\}/g;

export function extractPlaceholders(pathTemplate: string): string[] {
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(PLACEHOLDER_REGEX.source, 'g');
  while ((match = regex.exec(pathTemplate)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }
  return matches;
}

export function buildUrl(
  baseUrl: string,
  pathTemplate: string,
  params?: Record<string, string | number | boolean>,
  query?: Record<string, string | number | boolean>
): ExpansionResult {
  // Validate base URL
  let parsedBase: URL;
  try {
    parsedBase = new URL(baseUrl);
  } catch {
    return {
      success: false,
      error: `Invalid base URL: "${baseUrl}"`
    };
  }

  const expectedPlaceholders = extractPlaceholders(pathTemplate);
  const providedParams = params || {};
  const missingPlaceholders: string[] = [];

  for (const placeholder of expectedPlaceholders) {
    if (providedParams[placeholder] === undefined || providedParams[placeholder] === null) {
      missingPlaceholders.push(placeholder);
    }
  }

  if (missingPlaceholders.length > 0) {
    return {
      success: false,
      error: `Missing required path parameter(s): ${missingPlaceholders.map(p => `"{${p}}"`).join(', ')}`,
      unresolvedPlaceholders: missingPlaceholders
    };
  }

  // Substitute each placeholder with safely URL-encoded value
  let expandedPath = pathTemplate.replace(PLACEHOLDER_REGEX, (_match, key: string) => {
    const rawVal = providedParams[key];
    return encodeURIComponent(String(rawVal));
  });

  // Verify no remaining unresolved braces
  const remainingMatches = extractPlaceholders(expandedPath);
  if (remainingMatches.length > 0) {
    return {
      success: false,
      error: `Unresolved path placeholder(s) detected: ${remainingMatches.join(', ')}`,
      unresolvedPlaceholders: remainingMatches
    };
  }

  // Combine baseUrl path and expandedPath safely
  let combinedPathname: string;
  const basePath = parsedBase.pathname.replace(/\/+$/, '');
  const cleanExpanded = expandedPath.replace(/^\/+/, '');

  if (basePath && cleanExpanded) {
    combinedPathname = `${basePath}/${cleanExpanded}`;
  } else if (cleanExpanded) {
    combinedPathname = `/${cleanExpanded}`;
  } else if (basePath) {
    combinedPathname = basePath;
  } else {
    combinedPathname = '/';
  }

  parsedBase.pathname = combinedPathname;

  // Append query parameters if provided
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        parsedBase.searchParams.append(key, String(val));
      }
    }
  }

  return {
    success: true,
    url: parsedBase.toString()
  };
}
