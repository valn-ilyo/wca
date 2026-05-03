<template>
  <v-container
    class="fill-height d-flex flex-column align-center justify-center pa-4"
  >
    <v-sheet
      width="100%"
      max-width="480"
      rounded="lg"
      elevation="0"
      color="transparent"
    >
      <v-row justify="center" class="mb-2">
        <v-col cols="12" class="text-center">
          <img src="/icon.svg" alt="WhatsApp" height="44" class="mb-2" />
          <h1 class="text-headline-small text-primary font-weight-bold">
            WHATSAPP CHAT ANALYZER
          </h1>
        </v-col>
      </v-row>

      <v-card-text class="px-0">
        <v-file-upload
          density="comfortable"
          inset-file-list
          v-model="file"
          :disabled="analyzing"
          clearable
          icon="mdi-file-export-outline"
          title="Your chat export"
          subtitle=".zip or .txt"
          browse-text="Browse"
          divider-text="or"
          color="surface-variant"
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
          color="primary"
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

    <!-- PWA install banner — mobile only, hidden once installed -->
    <v-card
      v-if="showInstallBanner"
      width="100%"
      max-width="480"
      rounded="xl"
      border
      variant="flat"
      class="mt-4"
    >
      <!-- Android: native prompt available -->
      <template v-if="installPrompt">
        <v-card-item>
          <template #prepend>
            <v-icon icon="mdi-cellphone-arrow-down" color="primary" />
          </template>
          <v-card-title class="text-body-2 font-weight-medium">
            Install the app
          </v-card-title>
        </v-card-item>
        <v-card-text class="pt-0">
          <span class="text-body-2 text-medium-emphasis">
            Once installed, WhatsApp can share chats directly here — no file
            picking needed.
          </span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="flat"
            size="small"
            color="primary"
            @click="triggerInstall"
          >
            Install
          </v-btn>
        </v-card-actions>
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
        <v-card-text class="pt-0">
          <span class="text-body-2 text-medium-emphasis">
            Once installed, WhatsApp can share chats directly here.
          </span>
          <v-list density="compact" bg-color="transparent" class="pa-0 mt-2">
            <v-list-item class="px-0" min-height="28">
              <template #prepend>
                <span class="text-body-2 text-medium-emphasis mr-3">1.</span>
              </template>
              <v-list-item-title
                class="text-body-2 text-medium-emphasis text-wrap"
              >
                Tap <v-icon size="14" icon="mdi-export-variant" />
                <strong>Share</strong> in Safari
              </v-list-item-title>
            </v-list-item>
            <v-list-item class="px-0" min-height="28">
              <template #prepend>
                <span class="text-body-2 text-medium-emphasis mr-3">2.</span>
              </template>
              <v-list-item-title
                class="text-body-2 text-medium-emphasis text-wrap"
              >
                Tap <strong>Add to Home Screen</strong>
              </v-list-item-title>
            </v-list-item>
            <v-list-item class="px-0" min-height="28">
              <template #prepend>
                <span class="text-body-2 text-medium-emphasis mr-3">3.</span>
              </template>
              <v-list-item-title
                class="text-body-2 text-medium-emphasis text-wrap"
              >
                Tap <strong>Add</strong>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </template>
    </v-card>

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
import { ref, onMounted, onBeforeUnmount } from "vue";
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

// PWA install prompt
const installPrompt = ref<Event | null>(null);
const isIos = ref(false);
const showInstallBanner = ref(false);

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as any).standalone === true)
  );
}

function handleBeforeInstallPrompt(e: Event): void {
  e.preventDefault();
  installPrompt.value = e;
  if (isMobile() && !isInStandaloneMode()) {
    showInstallBanner.value = true;
  }
}

async function triggerInstall(): Promise<void> {
  const prompt = installPrompt.value as any;
  if (!prompt) return;
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  if (outcome === "accepted") {
    showInstallBanner.value = false;
    installPrompt.value = null;
  }
}

onMounted(async () => {
  // Check for iOS manually (no beforeinstallprompt on Safari)
  if (
    isMobile() &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !isInStandaloneMode()
  ) {
    isIos.value = true;
    showInstallBanner.value = true;
  }

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  // Handle incoming shared file from Web Share Target.
  // The SW intercepts the POST at /wca/share-target, stashes the file in
  // Cache API, then redirects here. We consume the cache entry and auto-analyze.
  try {
    const cache = await caches.open("share-target-v1");
    const response = await cache.match("/shared-file");
    if (!response) return;
    await cache.delete("/shared-file"); // consume — one shot
    const blob = await response.blob();
    const filename = decodeURIComponent(
      response.headers.get("X-Filename") ?? "chat-export",
    );
    file.value = new File([blob], filename, { type: blob.type });
    await processFile();
  } catch {
    // share target handling failed — user can still pick manually
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
});

async function sniffZip(f: File): Promise<boolean> {
  const buf = await f.slice(0, 4).arrayBuffer();
  const b = new Uint8Array(buf);
  return b[0] === 0x50 && b[1] === 0x4b; // PK magic bytes
}

async function processFile(): Promise<void> {
  const f = Array.isArray(file.value) ? file.value[0] : file.value;
  if (!f) return;
  analyzing.value = true;
  errorMsg.value = "";
  try {
    const isZip = await sniffZip(f);
    if (!isZip && !f.name.toLowerCase().endsWith(".txt"))
      throw new Error("Invalid file type — use .zip or .txt exports.");
    const text = isZip ? await extractFromZip(f) : await readAsText(f);
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
