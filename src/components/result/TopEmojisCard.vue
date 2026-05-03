<template>
  <v-card variant="flat" rounded="xl" border>
    <v-card-title class="text-label-large font-weight-bold pt-4 px-4">
      Top Emojis
    </v-card-title>
    <v-card-text>
      <template v-if="topEmojis.length">
        <v-chip
          v-for="te in topEmojis"
          :key="te.emoji"
          variant="outlined"
          class="ma-1"
          size="small"
          rounded="pill"
        >
          {{ te.emoji }}
          <v-divider vertical class="mx-1" />
          <span class="font-weight-bold">{{ te.count }}</span>
        </v-chip>
      </template>
      <v-chip v-else variant="text" class="ma-1 text-medium-emphasis"
        >No emojis found</v-chip
      >
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { TopEmoji } from "@/types/analytics";
defineProps<{ topEmojis: TopEmoji[] }>();
</script>
