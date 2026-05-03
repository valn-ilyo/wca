<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Message Share
    </v-card-title>
    <v-card-text class="d-flex flex-column align-center">
      <v-pie :items="pieItems" :palette="sliceColors" :size="180" />
      <v-divider class="my-3 w-100" />
      <v-list density="compact" bg-color="transparent" class="w-100 pa-0">
        <v-list-item
          v-for="(item, i) in legendItems"
          :key="item.name"
          class="px-0 py-0"
          min-height="32"
        >
          <template #prepend>
            <v-icon
              icon="mdi-circle"
              :color="sliceColors[i]"
              size="10"
              class="mr-3 opacity-100"
            />
          </template>
          <v-list-item-title class="text-body-small">{{
            item.name
          }}</v-list-item-title>
          <template #append>
            <span
              class="text-body-small font-weight-bold mr-2"
              :style="{ color: sliceColors[i] }"
            >
              {{ item.pct }}%
            </span>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ParticipantStats } from "@/types/analytics";
import { colorFor } from "@/lib/palette";

const props = defineProps<{ participants: Record<string, ParticipantStats> }>();

const names = computed(() => Object.keys(props.participants));
const sliceColors = computed(() => names.value.map((_, i) => colorFor(i)));
const total = computed(() =>
  names.value.reduce((s, n) => s + props.participants[n].messageCount, 0),
);

const pieItems = computed(() =>
  names.value.map((name, i) => ({
    key: i,
    title: name,
    value: props.participants[name].messageCount,
  })),
);

const legendItems = computed(() =>
  names.value.map((name) => ({
    name,
    count: props.participants[name].messageCount,
    pct: total.value
      ? Math.round((props.participants[name].messageCount / total.value) * 100)
      : 0,
  })),
);
</script>
