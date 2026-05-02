<template>
  <v-container
    class="fill-height d-flex flex-column align-center justify-center pa-4"
  >
    <v-sheet width="100%" max-width="480" rounded="lg" elevation="0">
      <v-row justify="center" class="mb-2">
        <v-col cols="12" class="text-center">
          <img src="/icon.svg" alt="WhatsApp" height="44" class="mb-2" />
          <h1 class="text-h6 text-primary font-weight-bold">
            WHATSAPP CHAT ANALYZER
          </h1>
        </v-col>
      </v-row>

      <v-card-text class="px-0">
        <v-file-upload
          density="compact"
          inset-file-list
          v-model="file"
          :disabled="analyzing"
          clearable
          icon="mdi-file-upload-outline"
          title="Drop your chat export here"
          subtitle=".zip or .txt"
          browse-text="Browse files"
          divider-text="or"
        />
      </v-card-text>

      <v-alert
        v-if="errorMsg"
        type="error"
        variant="tonal"
        density="compact"
        closable
        class="mb-3"
        @click:close="errorMsg = ''"
      >
        {{ errorMsg }}
      </v-alert>

      <v-card-actions class="justify-center px-0">
        <v-btn
          :loading="analyzing"
          :disabled="!file || (Array.isArray(file) && file.length === 0)"
          color="secondary"
          variant="flat"
          size="large"
          prepend-icon="mdi-file-search"
          rounded="lg"
          block
          @click="processFile"
        >
          Analyze
        </v-btn>
      </v-card-actions>
    </v-sheet>

    <v-btn
      href="https://www.instagram.com/valn_ilyo"
      target="_blank"
      rel="noopener"
      icon="mdi-instagram"
      variant="text"
      class="mt-4"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import JSZip from "jszip";
import { useChatStore } from "@/stores/chat";
import {
  detectDateTimePattern,
  extractChatAnalytics,
} from "@/composables/useAnalyzer";

const router = useRouter();
const chatStore = useChatStore();

const file = ref<File | File[] | undefined>(undefined);
const errorMsg = ref("");
const analyzing = ref(false);

async function processFile(): Promise<void> {
  const f = Array.isArray(file.value) ? file.value[0] : file.value;
  if (!f) return;
  analyzing.value = true;
  errorMsg.value = "";
  try {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".zip") && !name.endsWith(".txt"))
      throw new Error("Invalid file type — use .zip or .txt exports.");
    const text = name.endsWith(".zip")
      ? await extractFromZip(f)
      : await readAsText(f);
    analyzeChatContent(text);
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "Unknown error";
    analyzing.value = false;
  }
}

async function extractFromZip(f: File): Promise<string> {
  const zip = await JSZip.loadAsync(f);
  const chatFile = Object.values(zip.files).find((e) =>
    e.name.toLowerCase().startsWith("whatsapp chat with"),
  );
  if (!chatFile) throw new Error("No WhatsApp chat file found in the ZIP.");
  return readAsText(await chatFile.async("blob"));
}

function readAsText(source: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(source);
  });
}

function analyzeChatContent(content: string): void {
  const pattern = detectDateTimePattern(content);
  if (!pattern) throw new Error("Couldn't detect the chat's date-time format.");
  chatStore.setAnalytics(extractChatAnalytics(content, pattern));
  analyzing.value = false;
  router.push("/result");
}
</script>
