<template>
  <v-toolbar color="transparent" flat class="align-ver">
    <v-btn
      icon="mdi-arrow-left"
      variant="text"
      color="on-surface-variant"
      @click="router.push({ name: 'home' })"
    />

    <v-spacer />

    <span
      class="text-title-medium font-weight-bold text-primary text-uppercase text-center"
    >
      WhatsApp Chat Analyzer
    </span>

    <v-spacer />

    <!-- Tooltip only activates on the clipboard path (desktop).            -->
    <!-- On mobile, navigator.share fires and copied never becomes true.    -->
    <v-tooltip
      :model-value="copied"
      text="Copied!"
      location="bottom"
      :open-on-hover="false"
      :open-on-focus="false"
      :open-on-click="false"
    >
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon="mdi-share-variant-outline"
          variant="text"
          color="on-surface-variant"
          :loading="sharing"
          @click="share"
        />
      </template>
    </v-tooltip>
  </v-toolbar>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useShareUrl } from "@/composables/useShareUrl";

const router = useRouter();
const { share, sharing, copied } = useShareUrl();
</script>
