import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      resizeOptions: { background: "#F9F6F1" },
    },
    apple: {
      sizes: [180],
    },
  },
  images: ["public/icon.svg"],
});
