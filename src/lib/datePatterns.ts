import type { DateTimePatternResult } from "@/types/analytics";

/**
 * Supported WhatsApp export date formats (index matters — used in dateUtils.convertToISO).
 *
 *  0 → M/D/YY,  H:MM AM/PM   e.g. 1/15/24, 10:30 AM   (US 12h 2-digit year)
 *  1 → M/D/YY,  HH:MM        e.g. 1/15/24, 22:30       (US 24h 2-digit year)
 *  2 → D/M/YY,  H:MM am/pm   e.g. 15/1/24, 10:30 am    (intl 12h 2-digit year)
 *  3 → D/M/YYYY,H:MM am/pm   e.g. 15/1/2024, 10:30 am  (intl 12h 4-digit year)
 *  4 → D/M/YYYY,HH:MM        e.g. 02/07/2025, 21:28     (intl 24h 4-digit year)
 *
 * Note: no /g flag on any pattern — a stateful lastIndex would cause
 * .test() to alternate true/false on repeated calls with the same input.
 */
export const DATE_PATTERNS: RegExp[] = [
  /^((\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}\s[AP]M))/, // 0
  /^((\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{2}:\d{2}))/,           // 1
  /^((\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}\s[ap]m))/, // 2
  /^((\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{1,2}:\d{2}\s[ap]m))/, // 3
  /^((\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{2}:\d{2}))/,           // 4
];

/**
 * Detects which date/time format a WhatsApp export uses by inspecting the
 * first line of the file content.
 *
 * Returns the matched pattern + its index (needed for date normalisation),
 * or null if no known format matches.
 */
export function detectDateTimePattern(content: string): DateTimePatternResult | null {
  const firstLine = content.split("\n")[0];
  for (let i = 0; i < DATE_PATTERNS.length; i++) {
    if (DATE_PATTERNS[i].test(firstLine)) {
      return { pattern: DATE_PATTERNS[i], index: i };
    }
  }
  return null;
}
