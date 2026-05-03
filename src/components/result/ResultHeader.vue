<template>
  <v-toolbar color="transparent" flat>
    <template #prepend>
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        color="on-surface-variant"
        @click="router.back()"
      />
    </template>
    <template #title>
      <span
        class="text-caption font-weight-bold text-primary text-uppercase text-wrap"
        style="letter-spacing: 0.12em"
      >
        WhatsApp Chat Analyzer
      </span>
    </template>
  </v-toolbar>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>
