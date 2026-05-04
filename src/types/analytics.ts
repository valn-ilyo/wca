export interface ActivityDistribution {
  Morning: number;
  Afternoon: number;
  Evening: number;
  Night: number;
}

export type HourlyDistribution = number[];

export interface ParticipantStats {
  messageCount: number;
  wordCount: number;
  textMessageCount: number; // messages that are not media or system
  avgWordsPerMessage: number; // wordCount / textMessageCount, 0 if none
  mediaCount: number;
  linkCount: number;
  emojiCount: number;
  avgResponseTime: number | null; // seconds, null if never responded
  initiations: number; // sessions opened (gap >= 4 h, aligns with SESSION_GAP_MS)
}

export interface TopWord {
  word: string;
  count: number;
}

export interface TopEmoji {
  emoji: string;
  count: number;
}

export interface ChatAnalytics {
  startDate: string;
  endDate: string;
  totalDays: number;
  activeDays: number;
  messageCount: number;
  totalWords: number;
  mediaCount: number;
  linkCount: number;
  busiestDay: string;
  busiestDayCount: number;
  longestStreak: number;
  longestSilenceDays: number;
  averageResponseTime: string;
  averageMessagesPerDay: number;
  participants: Record<string, ParticipantStats>;
  activityDistribution: ActivityDistribution;
  hourlyDistribution: HourlyDistribution;
  dowDistribution: number[];
  sessionCount: number;
  avgSessionLength: number;
  maxSessionLength: number;
  topWords: TopWord[];
  topEmojis: TopEmoji[];
}

export interface DateTimePatternResult {
  pattern: RegExp;
  index: number;
}
