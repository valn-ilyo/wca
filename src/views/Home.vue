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
      <HomeHeader />

      <FileUploadSection
        v-model="file"
        :analyzing="analyzing"
        :error-msg="errorMsg"
        @analyze="processFile"
        @clear-error="errorMsg = ''"
      />
    </v-sheet>

    <PwaInstallBanner
      :show="showInstallBanner"
      :has-install-prompt="!!installPrompt"
      :is-ios="isIos"
      @install="triggerInstall"
      @dismiss="showInstallBanner = false"
    />

    <HomeFooter @open-help="helpDialog = true" />

    <HelpDialog v-model="helpDialog" :is-pwa="isPwa" />
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
import HomeHeader from "@/components/home/HomeHeader.vue";
import FileUploadSection from "@/components/home/FileUploadSection.vue";
import PwaInstallBanner from "@/components/home/PwaInstallBanner.vue";
import HomeFooter from "@/components/home/HomeFooter.vue";
import HelpDialog from "@/components/home/HelpDialog.vue";

const router = useRouter();
const chatStore = useChatStore();

const file = ref<File | File[] | undefined>(undefined);
const errorMsg = ref("");
const analyzing = ref(false);
const helpDialog = ref(false);
const isPwa = ref(false);

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
  isPwa.value = isInStandaloneMode();

  if (
    isMobile() &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !isInStandaloneMode()
  ) {
    isIos.value = true;
    showInstallBanner.value = true;
  }

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  try {
    const cache = await caches.open("share-target-v1");
    const response = await cache.match("/shared-file");
    if (!response) return;
    await cache.delete("/shared-file");
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

async function processFile(): Promise<void> {
  const f = Array.isArray(file.value) ? file.value[0] : file.value;
  if (!f) return;
  analyzing.value = true;
  errorMsg.value = "";
  try {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".zip") && !name.endsWith(".txt"))
      throw new Error("Invalid file type. Use .zip or .txt exports.");
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
