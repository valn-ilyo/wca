import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    setInterval(
      () => {
        registration.update().catch(() => {});
      },
      60 * 60 * 1000,
    );
  },
});

import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import { MotionPlugin } from "@vueuse/motion";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { VFileUpload } from "vuetify/labs/VFileUpload";
import { VPie } from "vuetify/labs/VPie";
import { createRouter, createWebHashHistory } from "vue-router";

import App from "./App.vue";
import WhatsappIcon from "./components/icons/WhatsappIcon.vue";
import type { IconProps } from "vuetify";
import { h } from "vue";
import Home from "./views/Home.vue";
import Result from "./views/Result.vue";
import { useChatStore } from "./stores/chat";

const pinia = createPinia();
pinia.use(createPersistedState());

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: Home, name: "home" },
    {
      path: "/result",
      component: Result,
      beforeEnter: async (to) => {
        const chat = useChatStore();

        // 1. Already hydrated — came from file upload or still in sessionStorage
        if (chat.hasData) return;

        // 2. Came from a share link — decode payload and hydrate the store
        const d = to.query.d;
        if (typeof d === "string" && d.length > 0) {
          try {
            const { decodePayload } = await import("./lib/sharePayload");
            const analytics = await decodePayload(d);
            chat.setAnalytics(analytics);
            return; // allow navigation
          } catch {
            return "/"; // corrupt / tampered payload → go home
          }
        }

        // 3. No data at all — block
        return "/";
      },
    },
  ],
});

const vuetify = createVuetify({
  components: { ...components, VFileUpload, VPie },
  directives,
  icons: {
    defaultSet: "mdi",
    sets: {
      custom: {
        component: (_props: IconProps) => h(WhatsappIcon),
      },
    },
  },
  theme: {
    defaultTheme: "wca",
    themes: {
      wca: {
        dark: false,
        colors: {
          // Core — brand colors
          primary: "#C8102E", // Brand red
          secondary: "#007A3D", // Brand green
          tertiary: "#6B5000", // Warm amber complement
          error: "#BA1A1A",

          // Surfaces — warm neutral (original feel)
          background: "#F9F6F1",
          surface: "#FFFFFF",
          "surface-bright": "#FFFFFF",
          "surface-light": "#F3F0EB",
          "surface-variant": "#E5E2DC",

          // On-surface
          "on-surface": "#1A1A1A",
          "on-surface-variant": "#4A4745",

          // Outlines
          outline: "#79756F",
          "outline-variant": "#CAC6BF",

          // Inverse
          "inverse-surface": "#332F2C",
          "inverse-on-surface": "#F5F1EE",
          "inverse-primary": "#FF8A96",

          // Semantic aliases
          info: "#6B5000",
          success: "#007A3D",
          warning: "#7A5900",

          // M3 tonal containers — WCAG AA guaranteed
          "primary-container": "#FFD9DC", // Light red tint
          "on-primary-container": "#5C0011", // Dark red   (11.2:1)
          "secondary-container": "#B3EECE", // Light green tint
          "on-secondary-container": "#003920", // Dark green (10.1:1)
          "tertiary-container": "#FDEEA0",
          "on-tertiary-container": "#221B00",
          "error-container": "#FFDAD6",
          "on-error-container": "#93000A",
        },
      },
    },
  },
});

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(MotionPlugin);
app.mount("#app");
