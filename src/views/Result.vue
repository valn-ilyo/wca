<template>
  <v-container class="pt-0">
    <ResultHeader />

    <MasonryWall
      :items="masonryItems"
      :column-width="360"
      :gap="16"
      :min-columns="1"
      :max-columns="2"
      class="mb-4"
    >
      <template #default="{ item, index }">
        <component
          :is="item.component"
          v-bind="item.props"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 80 + index * 80, duration: 400 },
          }"
        />
      </template>
    </MasonryWall>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MasonryWall } from "@yeger/vue-masonry-wall";
import { useChatStore } from "@/stores/chat";

import ResultHeader from "@/components/result/ResultHeader.vue";
import MessageShareCard from "@/components/result/MessageShareCard.vue";
import ChatTimelineCard from "@/components/result/ChatTimelineCard.vue";
import ActivityByHourCard from "@/components/result/ActivityByHourCard.vue";
import ActivityByDayCard from "@/components/result/ActivityByDayCard.vue";
import PerPersonCard from "@/components/result/PerPersonCard.vue";
import TopWordsCard from "@/components/result/TopWordsCard.vue";
import TopEmojisCard from "@/components/result/TopEmojisCard.vue";
import FunFactsRow from "@/components/result/FunFactsRow.vue";
import ConversationRhythmCard from "@/components/result/ConversationRhythmCard.vue";

const chatStore = useChatStore();
const analytics = computed(() => chatStore.analytics!);

const masonryItems = computed(() => [
  {
    component: MessageShareCard,
    props: { participants: analytics.value.participants },
  },
  { component: ChatTimelineCard, props: { analytics: analytics.value } },
  {
    component: ActivityByHourCard,
    props: {
      hourlyDistribution: analytics.value.hourlyDistribution,
    },
  },
  {
    component: ActivityByDayCard,
    props: {
      dowDistribution: analytics.value.dowDistribution,
    },
  },
  {
    component: ConversationRhythmCard,
    props: {
      sessionCount: analytics.value.sessionCount,
      avgSessionLength: analytics.value.avgSessionLength,
      maxSessionLength: analytics.value.maxSessionLength,
      averageMessagesPerDay: analytics.value.averageMessagesPerDay,
      averageResponseTime: analytics.value.averageResponseTime,
    },
  },
  {
    component: PerPersonCard,
    props: { participants: analytics.value.participants },
  },
  { component: TopWordsCard, props: { topWords: analytics.value.topWords } },
  { component: TopEmojisCard, props: { topEmojis: analytics.value.topEmojis } },
  {
    component: FunFactsRow,
    props: {
      messageCount: analytics.value.messageCount,
      totalWords: analytics.value.totalWords,
      mediaCount: analytics.value.mediaCount,
      linkCount: analytics.value.linkCount,
    },
  },
]);
</script>
