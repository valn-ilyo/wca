import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { MotionPlugin } from '@vueuse/motion'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VFileUpload } from 'vuetify/labs/VFileUpload'
import { createRouter, createWebHashHistory } from 'vue-router'

import App from './App.vue'
import Home from './views/Home.vue'
import Result from './views/Result.vue'
import { useChatStore } from './stores/chat'

/* ── Pinia ──────────────────────────────────── */
const pinia = createPinia()
pinia.use(createPersistedState())

/* ── Router ─────────────────────────────────── */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    {
      path: '/result',
      component: Result,
      beforeEnter: () => {
        const chat = useChatStore()
        if (!chat.hasData) return '/'
      },
    },
  ],
})

/* ── Vuetify ────────────────────────────────── */
const vuetify = createVuetify({
  components: {
    ...components,
    VFileUpload,
  },
  directives,
  icons: { defaultSet: 'mdi' },
  theme: {
    defaultTheme: 'wca',
    themes: {
      wca: {
        dark: false,
        colors: {
          primary: '#C8102E',
          secondary: '#007A3D',
          surface: '#F9F6F1',
          background: '#F9F6F1',
          'on-surface': '#1a1a1a',
        },
      },
    },
  },
})

/* ── App ────────────────────────────────────── */
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(MotionPlugin)
app.mount('#app')
