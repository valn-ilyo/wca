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
        class="d-flex align-center text-body-medium text-medium-emphasis mt-1"
        style="padding: 0 10px"
      >
        <template v-for="(tick, i) in axisLabels" :key="tick">
          <span>{{ tick }}</span>
          <div
            v-if="i < periods.length"
            class="d-flex flex-grow-1 justify-center"
          >
            <v-icon size="small" class="text-medium-emphasis" color="secondary">
              {{ periods[i].icon }}
            </v-icon>
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { HourlyDistribution } from "@/types/analytics";

const props = defineProps<{
  hourlyDistribution: HourlyDistribution;
}>();

const hourValues = computed(() => {
  return [...props.hourlyDistribution, props.hourlyDistribution[0]];
});

const axisLabels = ["0", "6", "12", "18", "24"];

const periods = [
  { icon: "mdi-weather-night" },
  { icon: "mdi-weather-partly-cloudy" },
  { icon: "mdi-weather-sunny" },
  { icon: "mdi-weather-sunset" },
];
</script>
