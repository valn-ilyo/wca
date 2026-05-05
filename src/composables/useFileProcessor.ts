import { ref } from "vue";
import { useRouter } from "vue-router";
import JSZip from "jszip";
import { useChatStore } from "@/stores/chat";
import { detectDateTimePattern, extractChatAnalytics } from "@/composables/useAnalyzer";

/**
 * Encapsulates the file-ingestion pipeline: reading a .txt or .zip upload,
 * extracting the WhatsApp chat text, running analysis, and navigating to results.
 *
 * Returns:
 * - `file`        — v-model binding for the file input
 * - `analyzing`   — true while processing is in progress
 * - `errorMsg`    — human-readable error string, empty when no error
 * - `processFile()` — kicks off the full pipeline for the current `file` value
 */
export function useFileProcessor() {
  const router = useRouter();
  const chatStore = useChatStore();

  const file = ref<File | File[] | undefined>(undefined);
  const analyzing = ref(false);
  const errorMsg = ref("");

  /** Reads a File or Blob as UTF-8 text. */
  function readAsText(source: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsText(source);
    });
  }

  /** Unzips a WhatsApp export and returns the chat text. */
  async function extractFromZip(f: File): Promise<string> {
    const zip = await JSZip.loadAsync(f);
    const entries = Object.values(zip.files);

    // Primary: match the English export filename prefix.
    // Fallback: any .txt file in the archive — covers non-English locales
    // (e.g. "WhatsApp Chat mit …" in German, "Chat de WhatsApp con …" in Spanish).
    const chatFile =
      entries.find((e) => e.name.toLowerCase().startsWith("whatsapp chat with")) ??
      entries.find((e) => e.name.toLowerCase().endsWith(".txt") && !e.dir);

    if (!chatFile) throw new Error("No WhatsApp chat file found in the ZIP.");
    return readAsText(await chatFile.async("blob"));
  }

  /** Runs the analytics pipeline and navigates to /result on success. */
  function analyzeChatContent(content: string): void {
    const pattern = detectDateTimePattern(content);
    if (!pattern) throw new Error("Couldn't detect the chat's date-time format.");
    chatStore.setAnalytics(extractChatAnalytics(content, pattern));
    analyzing.value = false;
    router.push("/result");
  }

  /** Entry point — validates, reads, and analyses the current file selection. */
  async function processFile(): Promise<void> {
    const f = Array.isArray(file.value) ? file.value[0] : file.value;
    if (!f) return;

    analyzing.value = true;
    errorMsg.value = "";

    try {
      const name = f.name.toLowerCase();
      if (!name.endsWith(".zip") && !name.endsWith(".txt"))
        throw new Error("Invalid file type. Use .zip or .txt exports.");

      const text = name.endsWith(".zip") ? await extractFromZip(f) : await readAsText(f);
      analyzeChatContent(text);
    } catch (err) {
      errorMsg.value = err instanceof Error ? err.message : "Unknown error";
      analyzing.value = false;
    }
  }

  return { file, analyzing, errorMsg, processFile };
}
