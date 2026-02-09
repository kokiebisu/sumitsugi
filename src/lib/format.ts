/**
 * Format a date string to Japanese locale display format.
 * Example: "2026-04-15" -> "2026年4月15日"
 */
export function formatDateJa(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
