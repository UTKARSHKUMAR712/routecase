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

  // Split path template into pathname and query string parts at the first '?'
  const qIndex = pathTemplate.indexOf('?');
  const pathPart = qIndex !== -1 ? pathTemplate.slice(0, qIndex) : pathTemplate;
  const templateQueryPart = qIndex !== -1 ? pathTemplate.slice(qIndex + 1) : '';

  // Substitute each placeholder in pathPart with safely URL-encoded value
  const expandedPathPart = pathPart.replace(PLACEHOLDER_REGEX, (_match, key: string) => {
    const rawVal = providedParams[key];
    return encodeURIComponent(String(rawVal));
  });

  // Substitute each placeholder in templateQueryPart with safely URL-encoded value
  const expandedTemplateQuery = templateQueryPart.replace(PLACEHOLDER_REGEX, (_match, key: string) => {
    const rawVal = providedParams[key];
    return encodeURIComponent(String(rawVal));
  });

  // Verify no remaining unresolved braces in either part
  const remainingMatches = [
    ...extractPlaceholders(expandedPathPart),
    ...extractPlaceholders(expandedTemplateQuery)
  ];
  if (remainingMatches.length > 0) {
    return {
      success: false,
      error: `Unresolved path placeholder(s) detected: ${remainingMatches.join(', ')}`,
      unresolvedPlaceholders: remainingMatches
    };
  }

  // Combine baseUrl path and expandedPathPart safely without query string
  let combinedPathname: string;
  const basePath = parsedBase.pathname.replace(/\/+$/, '');
  const cleanPath = expandedPathPart.replace(/^\/+/, '');

  if (basePath && cleanPath) {
    combinedPathname = `${basePath}/${cleanPath}`;
  } else if (cleanPath) {
    combinedPathname = `/${cleanPath}`;
  } else if (basePath) {
    combinedPathname = basePath;
  } else {
    combinedPathname = '/';
  }

  parsedBase.pathname = combinedPathname;

  // Assemble query string parts
  const queryParts: string[] = [];
  const existingBaseSearch = parsedBase.search.replace(/^\?/, '');
  if (existingBaseSearch) {
    queryParts.push(existingBaseSearch);
  }
  if (expandedTemplateQuery) {
    queryParts.push(expandedTemplateQuery);
  }
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
      }
    }
  }

  if (queryParts.length > 0) {
    parsedBase.search = queryParts.join('&');
  } else {
    parsedBase.search = '';
  }

  return {
    success: true,
    url: parsedBase.toString()
  };
}
