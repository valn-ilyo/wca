<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Top Words
    </v-card-title>
    <v-card-text>
      <v-chip
        v-for="(tw, _i) in topWords"
        :key="tw.word"
        variant="outlined"
        class="ma-1"
        size="small"
        rounded="pill"
      >
        {{ tw.word }}
        <v-divider vertical class="mx-1" />
        <span class="font-weight-bold">{{ tw.count }}</span>
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { TopWord } from "@/types/analytics";
defineProps<{ topWords: TopWord[] }>();
</script>
