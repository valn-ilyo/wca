import { ref } from "vue";
import { useRouter } from "vue-router";
import { useChatStore } from "@/stores/chat";
import { encodePayload } from "@/lib/sharePayload";

export function useShareUrl() {
  const router = useRouter();
  const chatStore = useChatStore();
  const sharing = ref(false);
  const copied = ref(false);

  async function share() {
    if (!chatStore.analytics) return;
    sharing.value = true;

    try {
      const d = await encodePayload(chatStore.analytics);
      // router.resolve returns e.g. /#/result?d=... with hash history —
      // prepend only origin (not pathname) to avoid double-slash.
      const resolved = router.resolve({ path: "/result", query: { d } });
      const url = `${location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}${resolved.href}`;

      if (navigator.share) {
        // Native share sheet on mobile — no clipboard feedback needed.
        await navigator.share({ title: "WhatsApp Chat Analysis", url });
      } else {
        await navigator.clipboard.writeText(url);
        copied.value = true;
        setTimeout(() => (copied.value = false), 2500);
      }
    } catch {
      // User cancelled native share or clipboard was denied — silently ignore.
    } finally {
      sharing.value = false;
    }
  }

  return { share, sharing, copied };
}
