import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/wca/index.html',
        // Allow the share target POST route through the SW
        navigateFallbackDenylist: [/^\/wca\/share/],
      },
      manifest: {
        name: 'WhatsApp Chat Analyzer',
        short_name: 'WCA',
        theme_color: '#C8102E',
        background_color: '#F9F6F1',
        display: 'standalone',
        start_url: '/wca/',
        scope: '/wca/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        share_target: {
          action: '/wca/',
          method: 'GET',
          params: {
            files: [
              {
                name: 'chat',
                accept: ['text/plain', '.txt', 'application/zip', '.zip'],
              },
            ],
          },
        },
      },
    }),
  ],
  base: '/wca/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
