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
import { ref, onMounted } from "vue";
import { usePwaInstall } from "@/composables/usePwaInstall";
import { useFileProcessor } from "@/composables/useFileProcessor";
import HomeHeader from "@/components/home/HomeHeader.vue";
import FileUploadSection from "@/components/home/FileUploadSection.vue";
import PwaInstallBanner from "@/components/home/PwaInstallBanner.vue";
import HomeFooter from "@/components/home/HomeFooter.vue";
import HelpDialog from "@/components/home/HelpDialog.vue";

const helpDialog = ref(false);

const { isPwa, isIos, installPrompt, showInstallBanner, triggerInstall } = usePwaInstall();
const { file, analyzing, errorMsg, processFile } = useFileProcessor();

// Handle PWA share-target: if the app was opened via a shared file, load it automatically
onMounted(async () => {
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
    // Share target handling failed — user can still pick manually
  }
});
</script>
