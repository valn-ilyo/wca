<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Activity by Day
    </v-card-title>
    <v-card-text>
      <v-sparkline
        :model-value="dowDistribution"
        :labels="dowLabels"
        color="success"
        :line-width="30"
        :padding="8"
        auto-draw
        :auto-draw-duration="900"
        auto-draw-easing="ease-out"
        type="bar"
        smooth
        label-size="12"
      >
        <template #label="{ value }">
          <tspan style="fill: rgba(0, 0, 0, 0.6)">{{ value }}</tspan>
        </template>
      </v-sparkline>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  dowDistribution: number[];
}>();

const dowLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
</script>
