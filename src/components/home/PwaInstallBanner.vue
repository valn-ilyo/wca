<template>
  <v-card
    v-if="show"
    width="100%"
    max-width="480"
    rounded="xl"
    border
    variant="flat"
    class="mt-2"
  >
    <!-- Android: native prompt available -->
    <template v-if="hasInstallPrompt">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-cellphone-arrow-down" color="primary" />
        </template>
        <v-card-title class="text-body-2 font-weight-medium">
          Install the app
        </v-card-title>
      </v-card-item>
    </template>

    <!-- iOS: no prompt API, give manual instructions -->
    <template v-else-if="isIos">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-apple" color="primary" />
        </template>
        <v-card-title class="text-body-2 font-weight-medium">
          Add to Home Screen
        </v-card-title>
      </v-card-item>
    </template>

    <!-- Firefox Android: no prompt API, give manual instructions -->
    <template v-else-if="isFirefoxAndroid">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-firefox" color="primary" />
        </template>
        <v-card-title class="text-body-2 font-weight-medium">
          Install the app
        </v-card-title>
      </v-card-item>
    </template>

    <!-- Shared description -->
    <v-card-text class="pt-0">
      <span class="text-body-2 text-medium-emphasis">
        Once installed, WhatsApp can share chats directly here. No file picking
        needed.
      </span>

      <!-- iOS steps -->
      <v-list
        v-if="isIos && !hasInstallPrompt"
        density="compact"
        bg-color="transparent"
        class="pa-0 mt-2"
      >
        <v-list-item class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-2 text-medium-emphasis mr-3">1.</span>
          </template>
          <v-list-item-title class="text-body-2 text-medium-emphasis text-wrap">
            Tap <v-icon size="14" icon="mdi-export-variant" />
            <strong>Share</strong> in Safari
          </v-list-item-title>
        </v-list-item>
        <v-list-item class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-2 text-medium-emphasis mr-3">2.</span>
          </template>
          <v-list-item-title class="text-body-2 text-medium-emphasis text-wrap">
            Tap <strong>Add to Home Screen</strong>
          </v-list-item-title>
        </v-list-item>
        <v-list-item class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-2 text-medium-emphasis mr-3">3.</span>
          </template>
          <v-list-item-title class="text-body-2 text-medium-emphasis text-wrap">
            Tap <strong>Add</strong>
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Firefox Android steps -->
      <v-list
        v-if="isFirefoxAndroid && !hasInstallPrompt"
        density="compact"
        bg-color="transparent"
        class="pa-0 mt-2"
      >
        <v-list-item class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-2 text-medium-emphasis mr-3">1.</span>
          </template>
          <v-list-item-title class="text-body-2 text-medium-emphasis text-wrap">
            Tap the <v-icon size="14" icon="mdi-dots-vertical" />
            <strong>menu</strong> in Firefox
          </v-list-item-title>
        </v-list-item>
        <v-list-item class="px-0" min-height="28">
          <template #prepend>
            <span class="text-body-2 text-medium-emphasis mr-3">2.</span>
          </template>
          <v-list-item-title class="text-body-2 text-medium-emphasis text-wrap">
            Tap <strong>Install</strong> (or <strong>Add to Home screen</strong>)
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>

    <!-- Shared actions -->
    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" size="small" @click="$emit('dismiss')">
        Dismiss
      </v-btn>
      <v-btn
        v-if="hasInstallPrompt"
        variant="flat"
        size="small"
        color="primary"
        @click="$emit('install')"
      >
        Install
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  hasInstallPrompt: boolean;
  isIos: boolean;
  isFirefoxAndroid?: boolean;
}>();

defineEmits<{
  install: [];
  dismiss: [];
}>();
</script>
