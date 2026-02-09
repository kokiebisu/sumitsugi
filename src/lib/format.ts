/**
 * Format a date string to Japanese locale display format.
 * Example: "2026-04-15" -> "2026年4月15日"
 */
export function formatDateJa(dateString: string): string {
  // Append time to force local interpretation for date-only strings (YYYY-MM-DD)
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? dateString + 'T00:00:00'
    : dateString;
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
