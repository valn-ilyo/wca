/**
 * Shared regex patterns and timing constants for WhatsApp chat parsing.
 */

/** Matches WhatsApp system/noise messages that should be excluded from analysis. */
export const SYSTEM_MESSAGE_PATTERNS: RegExp[] = [
  /^<media omitted>$/i,
  /^this message was deleted$/i,
  /^you deleted this message$/i,
  /^missed (voice|video) call$/i,
  /^null$/i,
  /messages and calls are end-to-end encrypted/i,
  /added you/i,
  // NOTE: "/left$/i" and "/changed (the|their|this)/i" were removed.
  // Group-leave and group-change events appear WITHOUT the "sender: body"
  // colon format in real exports, so they never reach this filter.
  // Those patterns were firing on legitimate user messages like
  // "I got 1 year left" and "Hendrix changed the sound of rock music".
];

/**
 * Unicode emoji matcher — /gu flags intentionally present so .match() and
 * .replace() iterate all occurrences.  Do NOT use with .test() or .exec()
 * in a loop without resetting lastIndex; both String methods (match/replace)
 * handle this correctly and are the only call-sites.
 */
export const EMOJI_REGEX = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;

/** Matches HTTP/HTTPS URLs. */
export const URL_REGEX = /https?:\/\/[^\s]+/g;

/** Matches the WhatsApp "edited" tag appended to modified messages. */
export const EDITED_TAG_REGEX = /<This message was edited>/gi;

/** Gap (ms) between messages that signals a new conversation session. */
export const SESSION_GAP_MS = 4 * 60 * 60 * 1_000; // 4 hours

/** One day in milliseconds. */
export const ONE_DAY_MS = 86_400_000;

/** Maximum gap (seconds) between messages to count as a genuine reply. */
export const MAX_REPLY_GAP_S = 4 * 3_600; // 4 hours
