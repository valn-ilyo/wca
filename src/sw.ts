/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();

// Precache everything Vite built
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// SPA fallback — serve index.html for all navigation except share-target
const handler = createHandlerBoundToURL("/wca/index.html");
registerRoute(
  new NavigationRoute(handler, {
    denylist: [/^\/wca\/share-target/],
  }),
);

// Web Share Target Level 2 — intercept the POST from the OS share sheet
self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (url.pathname !== "/wca/share-target" || event.request.method !== "POST")
    return;

  event.respondWith(
    (async () => {
      const formData = await event.request.formData();
      const file =
        (formData.get("chat") as File | null) ??
        ([...formData.values()].find((v) => v instanceof File) as File | null);
      if (file) {
        const cache = await caches.open("share-target-v1");
        await cache.put(
          "/shared-file",
          new Response(file, {
            headers: {
              "Content-Type": file.type || "application/octet-stream",
              "X-Filename": encodeURIComponent(file.name),
            },
          }),
        );
      }
      // Redirect into the app — hash router handles the rest client-side
      return Response.redirect("/wca/", 303);
    })(),
  );
});
