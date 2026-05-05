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
      const d = encodePayload(chatStore.analytics); // sync — no await needed

      const resolved = router.resolve({ path: "/result", query: { d } });
      const url = `${location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}${resolved.href}`;

      if (navigator.share) {
        await navigator.share({ title: "WhatsApp Chat Analysis", url });
      } else {
        await navigator.clipboard.writeText(url);
        copied.value = true;
        setTimeout(() => (copied.value = false), 2500);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // user cancelled native share sheet — expected, ignore
      } else {
        console.error("[useShareUrl] share error:", err);
      }
    } finally {
      sharing.value = false;
    }
  }

  return { share, sharing, copied };
}
