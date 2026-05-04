<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Chat Timeline
    </v-card-title>
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-1">
        <span
          class="text-body-small text-medium-emphasis d-flex align-center ga-1"
        >
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
        bg-color="primary"
        rounded="pill"
        :height="10"
        class="mb-2"
      />

      <v-list density="compact" bg-color="transparent" class="pa-0 mb-4">
        <v-list-item
          v-for="row in rows"
          :key="row.label"
          class="px-0"
          min-height="36"
        >
          <v-list-item-title class="text-body-small text-medium-emphasis">
            {{ row.label }}
          </v-list-item-title>
          <template #append>
            <span class="text-body-small font-weight-bold">{{
              row.value
            }}</span>
          </template>
        </v-list-item>
      </v-list>

      <v-divider class="mb-3 text-center" />
      <span class="text-caption text-medium-emphasis text-center d-block">
        The busiest day was <strong>{{ analytics.busiestDay }}</strong> with
        <strong
          >{{ analytics.busiestDayCount.toLocaleString() }} messages</strong
        >.
      </span>
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
  { label: "First message", value: props.analytics.startDate },
  { label: "Last message", value: props.analytics.endDate },
  { label: "Duration", value: normalizeDays(props.analytics.totalDays) },
  {
    label: "Active days",
    value: `${props.analytics.activeDays} of ${props.analytics.totalDays}`,
  },
  { label: "Longest streak", value: `${props.analytics.longestStreak} days` },
  {
    label: "Longest silence",
    value:
      props.analytics.longestSilenceDays === 1
        ? "1 day"
        : `${props.analytics.longestSilenceDays} days`,
  },
]);
</script>
