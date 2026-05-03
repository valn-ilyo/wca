<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Chat Timeline
    </v-card-title>
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-body-small text-medium-emphasis d-flex align-center ga-1">
          <v-icon icon="mdi-calendar-check-outline" size="14" />
          Active days
        </span>
        <span class="text-body-small font-weight-bold text-primary">
          {{ Math.round(activePct) }}%
        </span>
      </div>
      <v-progress-linear
        :model-value="activePct"
        color="primary"
        bg-color="surface-variant"
        height="4"
        rounded="pill"
        class="mb-5"
      />

      <v-list density="compact" bg-color="transparent" class="pa-0">
        <v-list-item
          v-for="row in rows"
          :key="row.label"
          class="px-0"
          min-height="36"
        >
          <template #prepend>
            <v-icon :icon="row.icon" size="15" class="mr-3 text-medium-emphasis" />
          </template>
          <v-list-item-title class="text-body-small text-medium-emphasis">
            {{ row.label }}
          </v-list-item-title>
          <template #append>
            <span class="text-body-small font-weight-bold">{{ row.value }}</span>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ChatAnalytics } from "@/types/analytics";
import { normalizeDays } from "@/composables/useAnalyzer";

const props = defineProps<{ analytics: ChatAnalytics }>();

const activePct = computed(
  () => (props.analytics.activeDays / props.analytics.totalDays) * 100,
);

const rows = computed(() => [
  { icon: "mdi-calendar-start",    label: "First message",   value: props.analytics.startDate },
  { icon: "mdi-calendar-end",      label: "Last message",    value: props.analytics.endDate },
  { icon: "mdi-calendar-range",    label: "Duration",        value: normalizeDays(props.analytics.totalDays) },
  { icon: "mdi-check-circle-outline", label: "Active days",  value: `${props.analytics.activeDays} of ${props.analytics.totalDays}` },
  { icon: "mdi-message-fast",      label: "Msgs / day",      value: String(props.analytics.averageMessagesPerDay) },
  { icon: "mdi-reply",             label: "Avg response",    value: props.analytics.averageResponseTime },
  { icon: "mdi-fire",              label: "Longest streak",  value: `${props.analytics.longestStreak} days` },
  { icon: "mdi-trophy",            label: "Busiest day",     value: `${props.analytics.busiestDay} (${props.analytics.busiestDayCount} msgs)` },
]);
</script>
