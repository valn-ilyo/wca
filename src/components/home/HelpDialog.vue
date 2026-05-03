<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="font-weight-bold pt-4 px-4">
        Export your chat
      </v-card-title>

      <v-card-text class="pt-2">
        <!-- Installed PWA: share directly -->
        <template v-if="isPwa">
          <v-list density="compact" bg-color="transparent" class="pa-0">
            <v-list-item v-for="(step, i) in pwaSteps" :key="i" class="px-0">
              <template #prepend>
                <span
                  class="text-body-2 text-medium-emphasis font-weight-bold mr-3"
                >
                  {{ i + 1 }}.
                </span>
              </template>
              <v-list-item-title class="text-body-2 text-wrap">
                <span v-for="(part, j) in parseStep(step)" :key="j">
                  <strong v-if="part.bold">{{ part.text }}</strong>
                  <template v-else>{{ part.text }}</template>
                </span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </template>

        <!-- Browser: browse manually -->
        <template v-else>
          <v-list density="compact" bg-color="transparent" class="pa-0">
            <v-list-item
              v-for="(step, i) in browserSteps"
              :key="i"
              class="px-0"
            >
              <template #prepend>
                <span
                  class="text-body-2 text-medium-emphasis font-weight-bold mr-3"
                >
                  {{ i + 1 }}.
                </span>
              </template>
              <v-list-item-title class="text-body-2 text-wrap">
                <span v-for="(part, j) in parseStep(step)" :key="j">
                  <strong v-if="part.bold">{{ part.text }}</strong>
                  <template v-else>{{ part.text }}</template>
                </span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </template>
      </v-card-text>

      <v-card-actions class="justify-end px-4 pb-4">
        <v-btn
          variant="flat"
          color="primary"
          @click="$emit('update:modelValue', false)"
        >
          Got it
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  isPwa: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const pwaSteps = [
  "Open WhatsApp and go to the chat you want to analyze",
  "Tap <strong>⋮ → More → Export Chat</strong>",
  "Choose <strong>Without Media</strong>",
  "In the share sheet, tap <strong>WCA</strong> and the chat loads automatically",
];

const browserSteps = [
  "Open WhatsApp and go to the chat you want to analyze",
  "Tap <strong>⋮ → More → Export Chat</strong>",
  "Choose <strong>Without Media</strong> and save the <strong>.zip</strong> file",
  "Tap <strong>Browse</strong> to load it",
];

function parseStep(step: string): { text: string; bold: boolean }[] {
  const parts: { text: string; bold: boolean }[] = [];
  const regex = /<strong>(.*?)<\/strong>/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(step)) !== null) {
    if (match.index > last)
      parts.push({ text: step.slice(last, match.index), bold: false });
    parts.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < step.length) parts.push({ text: step.slice(last), bold: false });
  return parts;
}
</script>
