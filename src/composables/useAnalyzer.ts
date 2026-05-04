import type {
  ChatAnalytics,
  DateTimePatternResult,
  ParticipantStats,
  TopWord,
  TopEmoji,
} from "@/types/analytics";

/* ─────────────────────────────────────────────
 * Constants
 * ───────────────────────────────────────────── */
const STOP_WORDS = new Set([
  // Pronouns
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "me",
  "him",
  "her",
  "them",
  "us",
  "it",
  "my",
  "your",
  "his",
  "our",
  "their",
  "its",
  "mine",
  "yours",
  "ours",
  "theirs",
  "myself",
  "yourself",
  "himself",
  "herself",
  "ourselves",
  "themselves",
  "itself",
  "this",
  "that",
  "these",
  "those",
  "who",
  "whom",
  "which",
  "what",
  "something",
  "someone",
  "anything",
  "anyone",
  "everything",
  "everyone",
  "nothing",
  "nobody",

  // Articles & conjunctions
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "so",
  "yet",
  "nor",
  "both",
  "either",
  "neither",
  "not",
  "nor",

  // Prepositions
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "out",
  "off",
  "over",
  "under",
  "again",
  "then",
  "once",
  "up",
  "down",
  "about",
  "against",
  "along",
  "around",
  "near",
  "per",
  "since",
  "until",
  "within",

  // Common verbs
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "am",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "done",
  "doing",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "must",
  "can",
  "could",
  "go",
  "went",
  "gone",
  "get",
  "got",
  "gotten",
  "getting",
  "know",
  "knew",
  "think",
  "thought",
  "see",
  "saw",
  "come",
  "came",
  "say",
  "said",
  "tell",
  "told",
  "ask",
  "asked",
  "make",
  "made",
  "take",
  "took",
  "want",
  "need",
  "use",
  "used",
  "let",
  "try",
  "keep",
  "put",
  "seem",
  "feel",
  "felt",
  "leave",
  "left",
  "call",
  "send",
  "sent",
  "give",
  "gave",
  "show",
  "find",
  "found",
  "look",
  "mean",
  "start",
  "started",
  "stop",
  "stopped",
  "talk",
  "talked",
  "stay",
  "turned",
  "turn",
  "become",
  "became",
  "bring",
  "brought",

  // Contractions (apostrophe-stripped)
  "dont",
  "doesnt",
  "didnt",
  "cant",
  "wont",
  "shouldnt",
  "wouldnt",
  "couldnt",
  "isnt",
  "arent",
  "wasnt",
  "werent",
  "hasnt",
  "havent",
  "hadnt",
  "im",
  "ive",
  "id",
  "ill",
  "youre",
  "youve",
  "youd",
  "youll",
  "hes",
  "shes",
  "its",
  "were",
  "theyre",
  "theyve",
  "theyd",
  "theyll",
  "weve",
  "wed",
  "well",
  "lets",
  "thats",
  "whats",
  "whos",
  "hows",
  "whens",
  "wheres",
  "theres",
  "heres",
  "its",
  "couldve",
  "wouldve",
  "shouldve",
  "mightve",
  "mustve",

  // Conversational fillers & affirmations
  // Only universal/structural ones — slang variants (lel, ouk, idk, dang, cuz…)
  // are left in so they can surface as characteristic words for each person
  "yes",
  "yeah",
  "yep",
  "yup",
  "yea",
  "nope",
  "nah",
  "no",
  "ok",
  "okay",
  "alright",
  "sure",
  "right",
  "fine",
  "good",
  "great",
  "nice",
  "cool",
  "wow",
  "oh",
  "ah",
  "uh",
  "um",
  "hmm",
  "hm",
  "hey",
  "hi",
  "hello",
  "bye",
  "haha",
  "lol",
  "hahaha",
  "lmao",
  "omg",
  "tbh",
  "btw",
  "ngl",
  "imo",

  // Adverbs & qualifiers
  "just",
  "also",
  "very",
  "really",
  "too",
  "more",
  "most",
  "less",
  "much",
  "many",
  "some",
  "any",
  "all",
  "both",
  "few",
  "other",
  "only",
  "even",
  "still",
  "already",
  "always",
  "never",
  "often",
  "now",
  "here",
  "there",
  "when",
  "where",
  "how",
  "why",
  "well",
  "back",
  "actually",
  "maybe",
  "probably",
  "basically",
  "literally",
  "anyway",
  "though",
  "like",
  "one",
  "two",
  "first",
  "last",
  "next",
  "new",
  "old",
  "same",
  "own",
  "every",
  "each",

  // WhatsApp system message noise
  "message",
  "deleted",
  "null",
  "missed",
  "voice",
  "video",
  "call",
  "joined",
  "added",
  "removed",
  "left",
  "changed",
  "group",
  "image",
  "sticker",
  "audio",
  "document",
  "contact",
  "location",
]);

const SYSTEM_MESSAGE_PATTERNS = [
  /^<media omitted>$/i,
  /^this message was deleted$/i,
  /^you deleted this message$/i,
  /^missed (voice|video) call$/i,
  /^null$/i,
  /messages and calls are end-to-end encrypted/i,
  /changed (the|their|this)/i,
  /added you/i,
  /left$/i,
];

const EMOJI_REGEX = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
const URL_REGEX = /https?:\/\/[^\s]+/g;
const EDITED_TAG_REGEX = /<This message was edited>/gi;

const CONVERSATION_GAP_MS = 60 * 60 * 1000; // 1 hour

/* ─────────────────────────────────────────────
 * Date-time pattern detection
 * ───────────────────────────────────────────── */

// Supported formats (index matters — used in convertToMMDDYY):
//
//  0 → M/D/YY,  H:MM AM/PM   e.g. 1/15/24, 10:30 AM   (US 12h 2-digit year)
//  1 → M/D/YY,  HH:MM        e.g. 1/15/24, 22:30       (US 24h 2-digit year)
//  2 → D/M/YY,  H:MM am/pm   e.g. 15/1/24, 10:30 am    (intl 12h 2-digit year)
//  3 → D/M/YYYY,H:MM am/pm   e.g. 15/1/2024, 10:30 am  (intl 12h 4-digit year)
//  4 → D/M/YYYY,HH:MM        e.g. 02/07/2025, 21:28     (intl 24h 4-digit year) ← NEW
//
// Note: no /g flag on any pattern — stateful lastIndex causes
// .test() to alternate true/false on repeated calls with the same input
const DATE_PATTERNS: RegExp[] = [
  /^((\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}\s[AP]M))/, // 0
  /^((\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{2}:\d{2}))/, // 1
  /^((\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}\s[ap]m))/, // 2
  /^((\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{1,2}:\d{2}\s[ap]m))/, // 3
  /^((\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{2}:\d{2}))/, // 4 ← NEW
];

export function detectDateTimePattern(
  content: string,
): DateTimePatternResult | null {
  const firstLine = content.split("\n")[0];
  for (let i = 0; i < DATE_PATTERNS.length; i++) {
    if (DATE_PATTERNS[i].test(firstLine)) {
      return { pattern: DATE_PATTERNS[i], index: i };
    }
  }
  return null;
}

/* ─────────────────────────────────────────────
 * Date helpers
 * ───────────────────────────────────────────── */
function convertToMMDDYY(dateStr: string, index: number): string {
  switch (index) {
    case 2: {
      // D/M/YY → M/D/YY
      const [day, month, year] = dateStr.split("/");
      return `${month}/${day}/${year}`;
    }
    case 3: {
      // D/M/YYYY → M/D/YY
      const [day, month, year] = dateStr.split("/");
      return `${month}/${day}/${year.slice(-2)}`;
    }
    case 4: {
      // D/M/YYYY → M/D/YY  (same swap as case 3, 24h clock)
      const [day, month, year] = dateStr.split("/");
      return `${month}/${day}/${year.slice(-2)}`;
    }
    default:
      return dateStr;
  }
}

function dateDiff(a: string, b: string): number {
  return Math.floor(Math.abs(Date.parse(b) - Date.parse(a)) / 86_400_000) + 1;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return h === 0 ? `${m}m ${s}s` : `${h}h ${m}m ${s}s`;
}

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

/* ─────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────── */
function extractEmojis(text: string): string[] {
  return [...(text.match(EMOJI_REGEX) ?? [])];
}

function isSystemMessage(body: string): boolean {
  return SYSTEM_MESSAGE_PATTERNS.some((p) => p.test(body.trim()));
}

/* ─────────────────────────────────────────────
 * Multiline preprocessing
 *
 * WhatsApp messages can span multiple lines.  Only the first line starts
 * with a date stamp; continuation lines begin with any non-digit character.
 * The regex engine (with the `m` flag) treats each physical line as a
 * separate candidate, so continuation lines are silently discarded.
 *
 * This pass collapses every continuation line into its parent message line
 * (joined with a space) so the regex sees each logical message as one line.
 * ───────────────────────────────────────────── */
function collapseMultilineMessages(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    // A new message line always starts with a digit (the date component)
    if (/^\d/.test(line) || out.length === 0) {
      out.push(line);
    } else {
      // Continuation — append to the previous message line
      out[out.length - 1] += " " + line;
    }
  }
  return out.join("\n");
}

/* ─────────────────────────────────────────────
 * Main extraction
 * ───────────────────────────────────────────── */
export function extractChatAnalytics(
  content: string,
  dateTimePattern: DateTimePatternResult,
): ChatAnalytics {
  content = collapseMultilineMessages(content);
  const pattern = new RegExp(
    dateTimePattern.pattern.source + "\\s-\\s(.*?):\\s?(.*)",
    "gm",
  );
  const matches = [...content.matchAll(pattern)];

  if (matches.length === 0) throw new Error("No messages found in chat");

  const startDateRaw = convertToMMDDYY(matches[0][2], dateTimePattern.index);
  const endDateRaw = convertToMMDDYY(
    matches[matches.length - 1][2],
    dateTimePattern.index,
  );

  const analytics: ChatAnalytics = {
    startDate: new Date(startDateRaw).toDateString(),
    endDate: new Date(endDateRaw).toDateString(),
    totalDays: dateDiff(startDateRaw, endDateRaw),
    activeDays: 0,
    messageCount: matches.length,
    totalWords: 0,
    mediaCount: 0,
    linkCount: 0,
    busiestDay: "",
    busiestDayCount: 0,
    longestStreak: 0,
    longestSilenceDays: 0,
    averageResponseTime: "",
    averageMessagesPerDay: 0,
    participants: {},
    activityDistribution: { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 },
    hourlyDistribution: Object.fromEntries(
      Array.from({ length: 24 }, (_, i) => [i, 0]),
    ),
    topWords: [],
    topEmojis: [],
  };

  processMessages(matches, analytics, dateTimePattern.index);
  return analytics;
}

function processMessages(
  messages: RegExpMatchArray[],
  analytics: ChatAnalytics,
  patternIndex: number,
): void {
  const wordFreq = new Map<string, number>();
  const emojiFreq = new Map<string, number>();

  const dayMessageCount = new Map<string, number>();
  const activeDaySet = new Set<string>();

  let lastSender = "";
  let lastTimestamp = 0;

  const responseTimesPerParticipant = new Map<string, number[]>();

  let currentStreak = 0;
  let longestStreak = 0;
  let prevDayMs = 0;
  let longestSilenceMs = 0;

  messages.forEach((match) => {
    const dateRaw = convertToMMDDYY(match[2], patternIndex);
    const timeRaw = match[3];
    const sender = match[4].trim();
    const body = (match[5] ?? "").trim();
    const bodyLower = body.toLowerCase();
    const isMedia = bodyLower === "<media omitted>";
    const isSystem = isSystemMessage(body);
    const timestamp = Date.parse(`${dateRaw} ${timeRaw}`) || 0;
    const hour = new Date(timestamp).getHours();
    const dateStr = new Date(timestamp).toDateString();
    const dayMs = new Date(timestamp).setHours(0, 0, 0, 0);

    // ── Active days & streak ──────────────────
    if (!activeDaySet.has(dateStr)) {
      activeDaySet.add(dateStr);
      dayMessageCount.set(dateStr, 0);
      if (prevDayMs && dayMs - prevDayMs === 86_400_000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDayMs = dayMs;
    }
    dayMessageCount.set(dateStr, (dayMessageCount.get(dateStr) ?? 0) + 1);

    // ── Participant init ──────────────────────
    if (!analytics.participants[sender]) {
      analytics.participants[sender] = {
        messageCount: 0,
        wordCount: 0,
        textMessageCount: 0,
        avgWordsPerMessage: 0,
        mediaCount: 0,
        linkCount: 0,
        emojiCount: 0,
        avgResponseTime: null,
        initiations: 0,
      };
      responseTimesPerParticipant.set(sender, []);
    }

    const p: ParticipantStats = analytics.participants[sender];
    p.messageCount++;

    // ── Media, links, words ───────────────────
    if (isMedia) {
      p.mediaCount++;
      analytics.mediaCount++;
    } else if (!isSystem) {
      const links = body.match(URL_REGEX) ?? [];
      p.linkCount += links.length;
      analytics.linkCount += links.length;

      const cleanBody = body
        .replace(EDITED_TAG_REGEX, "")
        .replace(URL_REGEX, "")
        .replace(EMOJI_REGEX, "")
        .trim();
      const words = cleanBody.split(/\s+/).filter((w) => w.length > 1);
      p.textMessageCount++;
      p.wordCount += words.length;
      analytics.totalWords += words.length;

      words.forEach((w) => {
        // Strip apostrophes so contractions normalise: "don't" → "dont"
        const lw = w.toLowerCase().replace(/[^a-z]/g, "");
        if (lw.length > 2 && !STOP_WORDS.has(lw)) {
          wordFreq.set(lw, (wordFreq.get(lw) ?? 0) + 1);
        }
      });

      const emojis = extractEmojis(body);
      p.emojiCount += emojis.length;
      emojis.forEach((e) => emojiFreq.set(e, (emojiFreq.get(e) ?? 0) + 1));
    }

    // ── Longest silence ───────────────────────
    if (lastTimestamp && timestamp > lastTimestamp) {
      const gap = timestamp - lastTimestamp;
      if (gap > longestSilenceMs) longestSilenceMs = gap;
    }

    // ── Response time (< 4h gap = genuine reply) ──
    if (lastSender && lastSender !== sender && lastTimestamp) {
      const rt = (timestamp - lastTimestamp) / 1000;
      if (rt > 0 && rt < 4 * 3600) {
        responseTimesPerParticipant.get(sender)?.push(rt);
      }
    }

    // ── Initiations: first message after 1h gap ──
    if (!lastTimestamp || timestamp - lastTimestamp >= CONVERSATION_GAP_MS) {
      if (analytics.participants[sender]) {
        analytics.participants[sender].initiations++;
      }
    }

    // ── Hourly / time-of-day ──────────────────
    analytics.hourlyDistribution[hour] =
      (analytics.hourlyDistribution[hour] ?? 0) + 1;
    if (hour >= 6 && hour < 12) analytics.activityDistribution.Morning++;
    else if (hour >= 12 && hour < 18)
      analytics.activityDistribution.Afternoon++;
    else if (hour >= 18 && hour < 22) analytics.activityDistribution.Evening++;
    else analytics.activityDistribution.Night++;

    lastSender = sender;
    lastTimestamp = timestamp;
  });

  // ── Aggregate fields ──────────────────────────
  analytics.activeDays = activeDaySet.size;
  analytics.longestStreak = longestStreak;
  analytics.longestSilenceDays = Math.floor(longestSilenceMs / 86_400_000);

  // Busiest day
  let maxDay = 0;
  dayMessageCount.forEach((count, day) => {
    if (count > maxDay) {
      maxDay = count;
      analytics.busiestDay = day;
      analytics.busiestDayCount = count;
    }
  });

  // Sort participants by message count
  analytics.participants = Object.fromEntries(
    Object.entries(analytics.participants).sort(
      ([, a], [, b]) => b.messageCount - a.messageCount,
    ),
  );

  // Compute avg response times per participant
  responseTimesPerParticipant.forEach((times, sender) => {
    if (times.length > 0 && analytics.participants[sender]) {
      analytics.participants[sender].avgResponseTime =
        times.reduce((a, b) => a + b, 0) / times.length;
    }
  });

  // Compute avg words per text message per participant
  Object.values(analytics.participants).forEach((p) => {
    p.avgWordsPerMessage =
      p.textMessageCount > 0
        ? Math.round((p.wordCount / p.textMessageCount) * 10) / 10
        : 0;
  });

  // Overall avg response time
  const allTimes: number[] = [];
  responseTimesPerParticipant.forEach((times) => allTimes.push(...times));
  analytics.averageResponseTime =
    allTimes.length > 0
      ? formatDuration(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
      : "N/A";

  analytics.averageMessagesPerDay = Math.round(
    analytics.messageCount / analytics.activeDays,
  );

  // Top 10 words
  analytics.topWords = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]): TopWord => ({ word, count }));

  // Top 8 emojis
  analytics.topEmojis = [...emojiFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([emoji, count]): TopEmoji => ({ emoji, count }));
}
