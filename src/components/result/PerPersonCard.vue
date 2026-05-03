<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Per Person
    </v-card-title>
    <v-card-text class="pa-0 pb-4">
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-medium-emphasis" style="width: 40%"></th>
            <th
              v-for="(name, idx) in names"
              :key="name"
              class="font-weight-bold text-body-small"
              :class="idx === 0 ? 'text-primary' : 'text-secondary'"
            >
              {{ name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in statRows" :key="stat.label">
            <td
              class="text-medium-emphasis text-body-small d-flex align-center ga-2 py-2"
            >
              <v-icon :icon="stat.icon" size="14" />
              {{ stat.label }}
            </td>
            <td
              v-for="(name, idx) in names"
              :key="name"
              class="text-body-small font-weight-bold"
              :class="idx === 0 ? 'text-primary' : 'text-secondary'"
            >
              {{ stat.value(name) }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ParticipantStats } from "@/types/analytics";
import { formatDuration } from "@/composables/useAnalyzer";

const props = defineProps<{
  participants: Record<string, ParticipantStats>;
}>();

const names = computed(() => Object.keys(props.participants));

const statRows = [
  {
    icon: "mdi-message-outline",
    label: "Messages",
    value: (n: string) => props.participants[n].messageCount.toLocaleString(),
  },
  {
    icon: "mdi-text",
    label: "Words sent",
    value: (n: string) => props.participants[n].wordCount.toLocaleString(),
  },
  {
    icon: "mdi-format-letter-case",
    label: "Avg words / message",
    value: (n: string) => props.participants[n].avgWordsPerMessage.toFixed(1),
  },
  {
    icon: "mdi-image-outline",
    label: "Media shared",
    value: (n: string) => props.participants[n].mediaCount.toLocaleString(),
  },
  {
    icon: "mdi-link",
    label: "Links shared",
    value: (n: string) => props.participants[n].linkCount.toLocaleString(),
  },
  {
    icon: "mdi-emoticon-outline",
    label: "Emojis used",
    value: (n: string) => props.participants[n].emojiCount.toLocaleString(),
  },
  {
    icon: "mdi-reply",
    label: "Avg response",
    value: (n: string) =>
      props.participants[n].avgResponseTime != null
        ? formatDuration(props.participants[n].avgResponseTime!)
        : "N/A",
  },
  {
    icon: "mdi-chat-outline",
    label: "Conversations started",
    value: (n: string) => props.participants[n].initiations.toLocaleString(),
  },
];
</script>
