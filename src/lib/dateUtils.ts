/**
 * Date/time utility functions for WhatsApp chat analytics.
 */

/**
 * Normalises a date string from any supported export format into M/D/YY
 * (the format accepted by JavaScript's Date.parse in all environments).
 *
 * Index values correspond to DATE_PATTERNS in datePatterns.ts:
 *   0, 1 → already M/D/YY — returned as-is
 *   2    → D/M/YY  → swap day & month
 *   3, 4 → D/M/YYYY → swap day & month, truncate year to 2 digits
 */
export function normalizeDate(dateStr: string, patternIndex: number): string {
  // Indices 2, 3, 4 are all D/M/… formats that need day↔month swap
  if (patternIndex < 2) return dateStr;

  const [day, month, year] = dateStr.split("/");
  // Truncate 4-digit year to last 2 digits for indices 3 & 4
  const yy = year.length === 4 ? year.slice(-2) : year;
  return `${month}/${day}/${yy}`;
}

/**
 * Returns the inclusive number of calendar days between two M/D/YY date strings.
 */
export function dateDiff(a: string, b: string): number {
  return Math.floor(Math.abs(Date.parse(b) - Date.parse(a)) / 86_400_000) + 1;
}

/**
 * Formats a duration given in seconds into a human-readable string.
 * e.g. 3723 → "1h 2m 3s", 90 → "1m 30s"
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  const s = Math.round(seconds % 60);
  return h === 0 ? `${m}m ${s}s` : `${h}h ${m}m ${s}s`;
}

/**
 * Converts a raw day count into a human-readable "X years Y months Z days" string.
 * Returns "0 days" if the input is 0.
 */
export function normalizeDays(days: number): string {
  const y = Math.floor(days / 365);
  const mo = Math.floor((days % 365) / 30);
  const d = days % 30;
  return (
    [
      y && `${y} year${y > 1 ? "s" : ""}`,
      mo && `${mo} month${mo > 1 ? "s" : ""}`,
      d && `${d} day${d > 1 ? "s" : ""}`,
    ]
      .filter(Boolean)
      .join(" ") || "0 days"
  );
}
