const SENSITIVE_HEADER_PATTERNS = [
  /^authorization$/i,
  /^proxy-authorization$/i,
  /^cookie$/i,
  /^set-cookie$/i,
  /^x-api-key$/i,
  /^api-key$/i,
  /^x-auth-token$/i,
  /^token$/i,
  /^secret$/i,
  /^access-token$/i,
  /^session-id$/i,
  /^x-amz-security-token$/i
];

export function isSensitiveHeader(headerName: string): boolean {
  return SENSITIVE_HEADER_PATTERNS.some(regex => regex.test(headerName.trim()));
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (isSensitiveHeader(key)) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export function sanitizePreview(content: string, maxLength: number = 2000): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + `\n... [truncated ${content.length - maxLength} bytes]`;
}
