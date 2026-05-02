import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatAnalytics } from '@/types/analytics'

export const useChatStore = defineStore(
  'chat',
  () => {
    const analytics = ref<ChatAnalytics | null>(null)

    const hasData = computed(() => analytics.value !== null)

    const participants = computed(() =>
      analytics.value ? Object.keys(analytics.value.participants) : []
    )

    const messageCounts = computed(() =>
      analytics.value
        ? Object.values(analytics.value.participants).map(p => p.messageCount)
        : []
    )

    const totalMessages = computed(() =>
      messageCounts.value.reduce((a, b) => a + b, 0)
    )

    function setAnalytics(data: ChatAnalytics): void {
      analytics.value = data
    }

    function clear(): void {
      analytics.value = null
    }

    return {
      analytics,
      hasData,
      participants,
      messageCounts,
      totalMessages,
      setAnalytics,
      clear,
    }
  },
  {
    persist: {
      storage: sessionStorage,
      pick: ['analytics'],
    },
  }
)
