<template>
  <div>
    <v-card-text class="px-0">
      <v-file-upload
        density="comfortable"
        inset-file-list
        :model-value="modelValue"
        :disabled="analyzing"
        clearable
        icon="mdi-file-export-outline"
        title="Your chat export"
        subtitle=".zip or .txt"
        browse-text="Browse"
        divider-text="or"
        color="surface-variant"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </v-card-text>

    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mb-3"
      @click:close="$emit('clear-error')"
    >
      {{ errorMsg }}
    </v-alert>

    <v-card-actions class="justify-center px-0">
      <v-btn
        :loading="analyzing"
        :disabled="!modelValue || (Array.isArray(modelValue) && modelValue.length === 0)"
        color="primary"
        variant="flat"
        size="large"
        prepend-icon="mdi-file-search"
        rounded="lg"
        block
        @click="$emit('analyze')"
      >
        Analyze
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: File | File[] | undefined;
  analyzing: boolean;
  errorMsg: string;
}>();

defineEmits<{
  "update:modelValue": [value: File | File[] | undefined];
  analyze: [];
  "clear-error": [];
}>();
</script>

<style scoped>
:deep(.v-file-upload-item) {
  background: transparent !important;
}
:deep(.v-file-upload-item .v-avatar) {
  background: rgb(var(--v-theme-surface-variant)) !important;
}
:deep(.v-file-upload .v-list) {
  background: transparent !important;
}
</style>
