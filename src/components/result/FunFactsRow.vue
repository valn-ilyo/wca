<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  messageCount: number;
  totalWords: number;
  mediaCount: number;
  linkCount: number;
  longestSilenceDays: number;
}>();

const facts = computed(() => {
  const items = [
    {
      icon: "mdi-message-text-outline",
      label: "Total messages",
      value: props.messageCount.toLocaleString(),
      color: "primary",
    },
    {
      icon: "mdi-format-text",
      label: "Total words",
      value: props.totalWords.toLocaleString(),
      color: "secondary",
    },
    {
      icon: "mdi-image-multiple-outline",
      label: "Media shared",
      value: props.mediaCount.toLocaleString(),
      color: undefined,
    },
    {
      icon: "mdi-link-variant",
      label: "Links shared",
      value: props.linkCount.toLocaleString(),
      color: undefined,
    },
  ];
  if (props.longestSilenceDays > 0) {
    items.push({
      icon: "mdi-sleep",
      label: "Longest silence",
      value:
        props.longestSilenceDays === 1
          ? "1 day"
          : `${props.longestSilenceDays} days`,
      color: undefined,
    });
  }
  return items;
});
</script>

<template>
  <v-card variant="flat" rounded="xl" border style="overflow: hidden">
    <v-card-text class="pa-0">
      <v-row no-gutters>
        <v-col
          v-for="(fact, i) in facts"
          :key="fact.label"
          class="fact-cell"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { delay: 560 + i * 60, duration: 380 },
          }"
        >
          <div
            class="d-flex flex-column align-center justify-center pa-5 text-center h-100"
          >
            <v-icon
              :icon="fact.icon"
              :color="fact.color ?? 'on-surface-variant'"
              size="22"
              class="mb-2"
            />
            <div
              class="text-h6 font-weight-bold"
              :class="fact.color ? `text-${fact.color}` : 'text-on-surface'"
            >
              {{ fact.value }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ fact.label }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.fact-cell {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
