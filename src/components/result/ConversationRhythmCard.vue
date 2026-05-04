<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Rhythm
    </v-card-title>
    <v-card-text>
      <v-list density="compact" bg-color="transparent" class="pa-0">
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
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  sessionCount: number;
  avgSessionLength: number;
  maxSessionLength: number;
  averageMessagesPerDay: number;
  averageResponseTime: string;
}>();

const rows = computed(() => [
  {
    label: "Average response time",
    value: props.averageResponseTime,
  },

  {
    label: "Average Messages per day",
    value: props.averageMessagesPerDay.toLocaleString(),
  },
  {
    label: "Average Messages per conversation",
    value: props.avgSessionLength.toLocaleString(),
  },
  {
    label: "Conversations",
    value: props.sessionCount.toLocaleString(),
  },
  {
    label: "Longest conversation",
    value: `${props.maxSessionLength.toLocaleString()} msgs`,
  },
]);
</script>
