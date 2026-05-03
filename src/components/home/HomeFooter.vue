<template>
  <div class="d-flex align-center gap-2 mt-2">
    <v-btn
      variant="text"
      size="small"
      prepend-icon="mdi-help-circle-outline"
      color="medium-emphasis"
      @click="$emit('open-help')"
    >
      How to export
    </v-btn>
    <v-btn
      href="https://www.instagram.com/valn_ilyo"
      target="_blank"
      rel="noopener"
      icon="mdi-instagram"
      variant="text"
      size="small"
    />
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  "open-help": [];
}>();
</script>
