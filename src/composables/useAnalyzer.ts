import type {
  ChatAnalytics,
  DateTimePatternResult,
  ParticipantStats,
  TopWord,
  TopEmoji,
} from "@/types/analytics";
import { STOP_WORDS } from "@/lib/stopWords";
import {
  SYSTEM_MESSAGE_PATTERNS,
  EMOJI_REGEX,
  URL_REGEX,
  EDITED_TAG_REGEX,
  SESSION_GAP_MS,
  ONE_DAY_MS,
  MAX_REPLY_GAP_S,
} from "@/lib/patterns";
import { normalizeDate, dateDiff, formatDuration } from "@/lib/dateUtils";

// Re-export helpers that external callers depend on
export { detectDateTimePattern } from "@/lib/datePatterns";
export { formatDuration, normalizeDays } from "@/lib/dateUtils";

/* ─────────────────────────────────────────────
 * Internal helpers
 * ───────────────────────────────────────────── */

function extractEmojis(text: string): string[] {
  return [...(text.match(EMOJI_REGEX) ?? [])];
}

function isSystemMessage(body: string): boolean {
  return SYSTEM_MESSAGE_PATTERNS.some((p) => p.test(body.trim()));
}

/**
 * Collapses multi-line WhatsApp messages into single lines.
 *
 * WhatsApp messages can span multiple lines but only the first line starts
 * with a date stamp. Without this pass the regex engine (with /m flag) would
 * silently discard continuation lines, losing part of every multi-line message.
 */
function collapseMultilineMessages(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (/^\d/.test(line) || out.length === 0) {
      out.push(line);
    } else {
      out[out.length - 1] += " " + line;
    }
  }
  return out.join("\n");
}

/** Increments a frequency map entry by 1. */
function inc(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

/** Returns the top N entries from a frequency map, sorted descending. */
function topN<T>(
  map: Map<string, number>,
  n: number,
  toItem: (key: string, count: number) => T,
): T[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => toItem(key, count));
}

/* ─────────────────────────────────────────────
 * Message parsing state (internal)
 * ───────────────────────────────────────────── */

interface MessageState {
  wordFreq: Map<string, number>;
  emojiFreq: Map<string, number>;
  dayMessageCount: Map<string, number>;
  activeDaySet: Set<string>;
  responseTimesPerParticipant: Map<string, number[]>;
  lastSender: string;
  lastTimestamp: number;
  currentStreak: number;
  longestStreak: number;
  prevDayMs: number;
  longestSilenceMs: number;
  // Session tracking
  sessionCount: number;
  currentSessionSize: number;
  maxSessionLength: number;
  sessionSizes: number[];
}

function createMessageState(): MessageState {
  return {
    wordFreq: new Map(),
    emojiFreq: new Map(),
    dayMessageCount: new Map(),
    activeDaySet: new Set(),
    responseTimesPerParticipant: new Map(),
    lastSender: "",
    lastTimestamp: 0,
    currentStreak: 0,
    longestStreak: 0,
    prevDayMs: 0,
    longestSilenceMs: 0,
    sessionCount: 0,
    currentSessionSize: 0,
    maxSessionLength: 0,
    sessionSizes: [],
  };
}

function initParticipant(
  analytics: ChatAnalytics,
  state: MessageState,
  sender: string,
): void {
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
  state.responseTimesPerParticipant.set(sender, []);
}

/* ─────────────────────────────────────────────
 * Per-message processing
 * ───────────────────────────────────────────── */

function processMatch(
  match: RegExpMatchArray,
  analytics: ChatAnalytics,
  state: MessageState,
  patternIndex: number,
): void {
  const dateRaw = normalizeDate(match[2], patternIndex);
  const timeRaw = match[3];
  const sender = match[4].trim();
  const body = (match[5] ?? "").trim();
  const isMedia = body.toLowerCase() === "<media omitted>";
  const isSystem = isSystemMessage(body);
  const timestamp = Date.parse(`${dateRaw} ${timeRaw}`) || 0;
  const date = new Date(timestamp);
  const hour = date.getHours();
  const dateStr = date.toDateString();
  const dayMs = new Date(timestamp).setHours(0, 0, 0, 0);

  updateDayTracking(state, dateStr, dayMs);

  if (!analytics.participants[sender])
    initParticipant(analytics, state, sender);
  const p: ParticipantStats = analytics.participants[sender];
  p.messageCount++;

  if (isMedia) {
    p.mediaCount++;
    analytics.mediaCount++;
  } else if (!isSystem) {
    processTextMessage(body, p, analytics, state);
  }

  updateSilenceTracking(state, timestamp);
  updateSessionTracking(state, timestamp);
  updateResponseTime(state, sender, timestamp);
  updateInitiations(state, analytics, sender, timestamp);
  updateHourlyDistribution(analytics, hour);

  // Day-of-week distribution: 0 = Sunday, 6 = Saturday
  analytics.dowDistribution[date.getDay()]++;

  state.lastSender = sender;
  state.lastTimestamp = timestamp;
}

function updateDayTracking(
  state: MessageState,
  dateStr: string,
  dayMs: number,
): void {
  if (!state.activeDaySet.has(dateStr)) {
    state.activeDaySet.add(dateStr);
    state.dayMessageCount.set(dateStr, 0);
    if (state.prevDayMs && dayMs - state.prevDayMs === ONE_DAY_MS) {
      state.currentStreak++;
    } else {
      state.currentStreak = 1;
    }
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
    state.prevDayMs = dayMs;
  }
  state.dayMessageCount.set(
    dateStr,
    (state.dayMessageCount.get(dateStr) ?? 0) + 1,
  );
}

function processTextMessage(
  body: string,
  p: ParticipantStats,
  analytics: ChatAnalytics,
  state: MessageState,
): void {
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

  for (const w of words) {
    const lw = w.toLowerCase().replace(/[^a-z]/g, "");
    if (lw.length > 2 && !STOP_WORDS.has(lw)) inc(state.wordFreq, lw);
  }

  const emojis = extractEmojis(body);
  p.emojiCount += emojis.length;
  for (const e of emojis) inc(state.emojiFreq, e);
}

function updateSilenceTracking(state: MessageState, timestamp: number): void {
  if (state.lastTimestamp && timestamp > state.lastTimestamp) {
    const gap = timestamp - state.lastTimestamp;
    if (gap > state.longestSilenceMs) state.longestSilenceMs = gap;
  }
}

function updateSessionTracking(state: MessageState, timestamp: number): void {
  const isNewSession =
    !state.lastTimestamp ||
    timestamp - state.lastTimestamp >= SESSION_GAP_MS;

  if (isNewSession) {
    // Close the previous session before opening a new one
    if (state.currentSessionSize > 0) {
      state.sessionSizes.push(state.currentSessionSize);
      if (state.currentSessionSize > state.maxSessionLength) {
        state.maxSessionLength = state.currentSessionSize;
      }
    }
    state.sessionCount++;
    state.currentSessionSize = 1;
  } else {
    state.currentSessionSize++;
  }
}

function updateResponseTime(
  state: MessageState,
  sender: string,
  timestamp: number,
): void {
  if (state.lastSender && state.lastSender !== sender && state.lastTimestamp) {
    const rt = (timestamp - state.lastTimestamp) / 1_000;
    if (rt > 0 && rt < MAX_REPLY_GAP_S) {
      state.responseTimesPerParticipant.get(sender)?.push(rt);
    }
  }
}

function updateInitiations(
  state: MessageState,
  analytics: ChatAnalytics,
  sender: string,
  timestamp: number,
): void {
  if (
    !state.lastTimestamp ||
    timestamp - state.lastTimestamp >= SESSION_GAP_MS
  ) {
    analytics.participants[sender].initiations++;
  }
}

function updateHourlyDistribution(
  analytics: ChatAnalytics,
  hour: number,
): void {
  analytics.hourlyDistribution[hour]++;
  if (hour >= 6 && hour < 12) analytics.activityDistribution.Morning++;
  else if (hour >= 12 && hour < 18) analytics.activityDistribution.Afternoon++;
  else if (hour >= 18 && hour < 22) analytics.activityDistribution.Evening++;
  else analytics.activityDistribution.Night++;
}

/* ─────────────────────────────────────────────
 * Aggregation (post-loop)
 * ───────────────────────────────────────────── */

function aggregateResults(analytics: ChatAnalytics, state: MessageState): void {
  analytics.activeDays = state.activeDaySet.size;
  analytics.longestStreak = state.longestStreak;
  analytics.longestSilenceDays = Math.floor(
    state.longestSilenceMs / ONE_DAY_MS,
  );

  // Busiest day
  state.dayMessageCount.forEach((count, day) => {
    if (count > analytics.busiestDayCount) {
      analytics.busiestDay = day;
      analytics.busiestDayCount = count;
    }
  });

  // Finalise the last open session
  if (state.currentSessionSize > 0) {
    state.sessionSizes.push(state.currentSessionSize);
    if (state.currentSessionSize > state.maxSessionLength) {
      state.maxSessionLength = state.currentSessionSize;
    }
  }
  analytics.sessionCount = state.sessionCount;
  analytics.maxSessionLength = state.maxSessionLength;
  analytics.avgSessionLength =
    state.sessionSizes.length > 0
      ? Math.round(
          state.sessionSizes.reduce((a, b) => a + b, 0) /
            state.sessionSizes.length,
        )
      : 0;

  // Sort participants by message count descending
  analytics.participants = Object.fromEntries(
    Object.entries(analytics.participants).sort(
      ([, a], [, b]) => b.messageCount - a.messageCount,
    ),
  );

  // Per-participant averages
  state.responseTimesPerParticipant.forEach((times, sender) => {
    if (times.length > 0 && analytics.participants[sender]) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      analytics.participants[sender].avgResponseTime =
        Math.round(avg * 10) / 10;
    }
  });

  Object.values(analytics.participants).forEach((p) => {
    p.avgWordsPerMessage =
      p.textMessageCount > 0
        ? Math.round((p.wordCount / p.textMessageCount) * 10) / 10
        : 0;
  });

  // Overall average response time
  const allTimes = [...state.responseTimesPerParticipant.values()].flat();
  analytics.averageResponseTime =
    allTimes.length > 0
      ? formatDuration(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
      : "N/A";

  analytics.averageMessagesPerDay = Math.round(
    analytics.messageCount / analytics.activeDays,
  );

  analytics.topWords = topN(
    state.wordFreq,
    10,
    (word, count): TopWord => ({ word, count }),
  );
  analytics.topEmojis = topN(
    state.emojiFreq,
    8,
    (emoji, count): TopEmoji => ({ emoji, count }),
  );
}

/* ─────────────────────────────────────────────
 * Public API
 * ───────────────────────────────────────────── */

/**
 * Parses raw WhatsApp export text and returns a fully populated ChatAnalytics object.
 *
 * @param content         Raw text content of the export (.txt or extracted from .zip)
 * @param dateTimePattern Pattern descriptor from detectDateTimePattern()
 * @throws if no messages are found
 */
export function extractChatAnalytics(
  content: string,
  dateTimePattern: DateTimePatternResult,
): ChatAnalytics {
  const collapsed = collapseMultilineMessages(content);
  const pattern = new RegExp(
    dateTimePattern.pattern.source + "\\s-\\s(.*?):\\s?(.*)",
    "gm",
  );
  const matches = [...collapsed.matchAll(pattern)];

  if (matches.length === 0) throw new Error("No messages found in chat");

  const startDateRaw = normalizeDate(matches[0][2], dateTimePattern.index);
  const endDateRaw = normalizeDate(
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
    hourlyDistribution: Array(24).fill(0),
    dowDistribution: [0, 0, 0, 0, 0, 0, 0],
    sessionCount: 0,
    avgSessionLength: 0,
    maxSessionLength: 0,
    topWords: [],
    topEmojis: [],
  };

  const state = createMessageState();
  for (const match of matches) {
    processMatch(match, analytics, state, dateTimePattern.index);
  }
  aggregateResults(analytics, state);

  return analytics;
}
