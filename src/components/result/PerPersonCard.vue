<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Per Person
    </v-card-title>
    <v-card-text class="pa-0 pb-4">
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-medium-emphasis"></th>
            <th
              v-for="(name, idx) in names"
              :key="name"
              class="font-weight-bold text-body-small text-wrap"
              :class="idx === 0 ? 'text-primary' : 'text-secondary'"
              style="min-width: 60px"
            >
              {{ name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in statRows" :key="stat.label">
            <td class="text-medium-emphasis text-body-small py-2">
              {{ stat.label }}
            </td>
            <td
              v-for="(name, idx) in names"
              :key="name"
              class="text-body-small font-weight-bold"
              style="white-space: nowrap"
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
import { useDisplay } from "vuetify";
import type { ParticipantStats } from "@/types/analytics";
import { formatDuration } from "@/composables/useAnalyzer";
const props = defineProps<{
  participants: Record<string, ParticipantStats>;
}>();
const { mobile } = useDisplay();
const names = computed(() => Object.keys(props.participants));
const statRows = computed(() => [
  {
    label: "Messages",
    value: (n: string) => props.participants[n].messageCount.toLocaleString(),
  },
  {
    label: "Words sent",
    value: (n: string) => props.participants[n].wordCount.toLocaleString(),
  },
  {
    label: mobile.value ? "Words / msg" : "Words per message",
    value: (n: string) => props.participants[n].avgWordsPerMessage.toFixed(1),
  },
  {
    label: "Media shared",
    value: (n: string) => props.participants[n].mediaCount.toLocaleString(),
  },
  {
    label: "Links shared",
    value: (n: string) => props.participants[n].linkCount.toLocaleString(),
  },
  {
    label: "Emojis used",
    value: (n: string) => props.participants[n].emojiCount.toLocaleString(),
  },
  {
    label: mobile.value ? "Avg response" : "Average response",
    value: (n: string) =>
      props.participants[n].avgResponseTime != null
        ? formatDuration(props.participants[n].avgResponseTime!)
        : "N/A",
  },
  {
    label: mobile.value ? "Convos started" : "Conversations started",
    value: (n: string) => props.participants[n].initiations.toLocaleString(),
  },
]);
</script>
