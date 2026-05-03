<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Activity by Hour
    </v-card-title>
    <v-card-text>
      <v-sparkline
        :model-value="hourValues"
        color="primary"
        :line-width="1.5"
        :padding="8"
        smooth
        fill
        auto-draw
        :auto-draw-duration="900"
        auto-draw-easing="ease-out"
      />
      <div
        class="d-flex justify-space-between text-body-small text-medium-emphasis mt-1 px-1"
      >
        <span v-for="label in axisLabels" :key="label">{{ label }}</span>
      </div>
      <v-divider class="my-2" />
      <div class="d-flex justify-space-between">
        <v-chip
          v-for="period in periods"
          :key="period.label"
          size="x-small"
          variant="text"
          class="text-medium-emphasis px-1"
          :prepend-icon="period.icon"
        >
          {{ period.label }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { HourlyDistribution } from "@/types/analytics";

const props = defineProps<{ hourlyDistribution: HourlyDistribution }>();

// Always start from midnight (hour 0) so the chart reads morning → night.
// We append hour 0's value at the end so the line smoothly closes back
// to where it started — no cliff between the last bar and the first.
const hourValues = computed(() => {
  const raw = Array.from(
    { length: 24 },
    (_, i) => props.hourlyDistribution[i] ?? 0,
  );
  return [...raw, raw[0]]; // 25 points: 0–23 + 0 again to close the loop
});

// Axis labels at hours 0, 6, 12, 18, and 0 again (circular cue).
const axisLabels = ["0", "6", "12", "18", "24"];

const periods = [
  { label: "Night", icon: "mdi-weather-night" },
  { label: "Morning", icon: "mdi-weather-sunrise" },
  { label: "Afternoon", icon: "mdi-weather-sunny" },
  { label: "Evening", icon: "mdi-weather-sunset" },
];
</script>
