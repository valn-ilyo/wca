import LZString from "lz-string";
import type { ChatAnalytics, ParticipantStats } from "@/types/analytics";

// ── key minification ─────────────────────────────────────────────────────────
//
// Derivable fields are dropped and recomputed on expand:
//   messageCount          = sum of p[*][0]
//   totalWords            = sum of p[*][1]
//   mediaCount            = sum of p[*][3]
//   linkCount             = sum of p[*][4]
//   averageMessagesPerDay = messageCount / activeDays
//   avgSessionLength      = messageCount / sessionCount
//   avgWordsPerMessage    = Math.round((wordCount / textMessageCount) * 10) / 10
//   activityDistribution  = bucketed from hourlyDistribution
//
// Participant stats collapsed into a positional tuple:
//   [mc, wc, tmc, md, lc, ec, art, init]
//    0   1   2    3   4   5   6    7

type MiniParticipantTuple = [
  number, // 0  messageCount
  number, // 1  wordCount
  number, // 2  textMessageCount
  number, // 3  mediaCount
  number, // 4  linkCount
  number, // 5  emojiCount
  number | null, // 6  avgResponseTime (seconds)
  number, // 7  initiations
];

interface MiniPayload {
  s: string; // startDate
  e: string; // endDate
  td: number; // totalDays (kept: +1 inclusive offset vs date diff)
  ad: number; // activeDays
  bd: string; // busiestDay
  bc: number; // busiestDayCount
  ls: number; // longestStreak
  si: number; // longestSilenceDays
  ar: string; // averageResponseTime (formatted string)
  p: Record<string, MiniParticipantTuple>; // participants
  hd: number[]; // hourlyDistribution (24 values)
  dd: number[]; // dowDistribution (7 values)
  sc: number; // sessionCount
  ml: number; // maxSessionLength
  wo: [string, number][]; // topWords
  em: [string, number][]; // topEmojis
}

function minify(a: ChatAnalytics): MiniPayload {
  const p: Record<string, MiniParticipantTuple> = {};
  for (const [name, s] of Object.entries(a.participants)) {
    p[name] = [
      s.messageCount,
      s.wordCount,
      s.textMessageCount,
      s.mediaCount,
      s.linkCount,
      s.emojiCount,
      s.avgResponseTime,
      s.initiations,
    ];
  }
  return {
    s: a.startDate,
    e: a.endDate,
    td: a.totalDays,
    ad: a.activeDays,
    bd: a.busiestDay,
    bc: a.busiestDayCount,
    ls: a.longestStreak,
    si: a.longestSilenceDays,
    ar: a.averageResponseTime,
    p,
    hd: a.hourlyDistribution,
    dd: a.dowDistribution,
    sc: a.sessionCount,
    ml: a.maxSessionLength,
    wo: a.topWords.map(({ word, count }) => [word, count]),
    em: a.topEmojis.map(({ emoji, count }) => [emoji, count]),
  };
}

function expand(m: MiniPayload): ChatAnalytics {
  const participants: Record<string, ParticipantStats> = {};
  for (const [name, t] of Object.entries(m.p)) {
    participants[name] = {
      messageCount: t[0],
      wordCount: t[1],
      textMessageCount: t[2],
      avgWordsPerMessage: t[2] > 0 ? Math.round((t[1] / t[2]) * 10) / 10 : 0,
      mediaCount: t[3],
      linkCount: t[4],
      emojiCount: t[5],
      avgResponseTime: t[6],
      initiations: t[7],
    };
  }

  const vals = Object.values(participants);
  const messageCount = vals.reduce((s, x) => s + x.messageCount, 0);

  // Mirrors updateHourlyDistribution in useAnalyzer.ts:
  //   Morning:   6 <= h < 12
  //   Afternoon: 12 <= h < 18
  //   Evening:   18 <= h < 24  (Night 22–23 moved here)
  //   Night:     0–5 only
  const hsum = (s: number, e: number) =>
    m.hd.slice(s, e).reduce((a, b) => a + b, 0);
  const activityDistribution = {
    Morning: hsum(6, 12),
    Afternoon: hsum(12, 18),
    Evening: hsum(18, 24),
    Night: hsum(0, 6),
  };

  return {
    startDate: m.s,
    endDate: m.e,
    totalDays: m.td,
    activeDays: m.ad,
    messageCount,
    totalWords: vals.reduce((s, x) => s + x.wordCount, 0),
    mediaCount: vals.reduce((s, x) => s + x.mediaCount, 0),
    linkCount: vals.reduce((s, x) => s + x.linkCount, 0),
    busiestDay: m.bd,
    busiestDayCount: m.bc,
    longestStreak: m.ls,
    longestSilenceDays: m.si,
    averageResponseTime: m.ar,
    averageMessagesPerDay: m.ad > 0 ? Math.round(messageCount / m.ad) : 0,
    participants,
    activityDistribution,
    hourlyDistribution: m.hd,
    dowDistribution: m.dd,
    sessionCount: m.sc,
    avgSessionLength: m.sc > 0 ? Math.round(messageCount / m.sc) : 0,
    maxSessionLength: m.ml,
    topWords: m.wo.map(([word, count]) => ({ word, count })),
    topEmojis: m.em.map(([emoji, count]) => ({ emoji, count })),
  };
}

// ── public API ───────────────────────────────────────────────────────────────
//
// LZ-String replaces CompressionStream("deflate-raw") entirely.
// Pure JS — no Web Streams API, no browser quirks, works everywhere.
// compressToEncodedURIComponent outputs a URL-safe string directly,
// so there is no separate base64url step needed.

export function encodePayload(analytics: ChatAnalytics): string {
  const mini = minify(analytics);
  const json = JSON.stringify(mini);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodePayload(encoded: string): ChatAnalytics {
  const json = LZString.decompressFromEncodedURIComponent(encoded);
  if (!json)
    throw new Error("Failed to decompress share payload — corrupted or empty.");
  const parsed = JSON.parse(json) as MiniPayload;
  return expand(parsed);
}
