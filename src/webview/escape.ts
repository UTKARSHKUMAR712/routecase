export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) {
    return '';
  }
  const s = typeof str === 'string' ? str : JSON.stringify(str, null, 2);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
