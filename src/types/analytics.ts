export interface ActivityDistribution {
  Morning: number
  Afternoon: number
  Evening: number
  Night: number
}

export interface HourlyDistribution {
  [hour: number]: number
}

export interface ParticipantStats {
  messageCount: number
  wordCount: number
  avgWordLength: number
  mediaCount: number
  linkCount: number
  emojiCount: number
  avgResponseTime: number | null // seconds, null if never responded
  initiations: number // days they sent the first message
}

export interface TopWord {
  word: string
  count: number
}

export interface TopEmoji {
  emoji: string
  count: number
}

export interface ChatAnalytics {
  startDate: string
  endDate: string
  totalDays: number
  activeDays: number
  messageCount: number
  totalWords: number
  mediaCount: number
  linkCount: number
  busiestDay: string
  busiestDayCount: number
  longestStreak: number
  averageResponseTime: string
  averageMessagesPerDay: number
  participants: Record<string, ParticipantStats>
  activityDistribution: ActivityDistribution
  hourlyDistribution: HourlyDistribution
  topWords: TopWord[]
  topEmojis: TopEmoji[]
}

export interface DateTimePatternResult {
  pattern: RegExp
  index: number
}
