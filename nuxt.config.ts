// https://nuxt.com/docs/api/configuration/nuxt-config
import { ACTIVITY_ICONS } from './shared/utils/catalog'

const baseURL = process.env.NUXT_APP_BASE_URL || '/'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@vite-pwa/nuxt'],

  css: ['~/assets/css/main.css'],

  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: 'it' },
      title: 'Reminder',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Diario quotidiano configurabile: attività, abitudini e note, offline.' },
        { name: 'theme-color', content: '#0f766e' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Reminder' },
      ],
      link: [
        { rel: 'icon', href: `${baseURL}favicon.ico`, sizes: '48x48' },
        { rel: 'icon', href: `${baseURL}icon.svg`, type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: `${baseURL}apple-touch-icon-180x180.png` },
        { rel: 'manifest', href: `${baseURL}manifest.webmanifest` },
      ],
    },
  },

  ui: {
    fonts: false,
    colorMode: true,
  },

  icon: {
    provider: 'none',
    fallbackToApi: false,
    clientBundle: {
      scan: true,
      // icone scelte dall'utente a runtime (editor attività): devono essere nel bundle
      icons: ACTIVITY_ICONS.map(name => name.replace('i-lucide-', 'lucide:')),
      sizeLimitKb: 512,
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Reminder – diario quotidiano',
      short_name: 'Reminder',
      description: 'Diario quotidiano configurabile: attività, abitudini e note, offline.',
      lang: 'it',
      theme_color: '#0f766e',
      background_color: '#fafaf9',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '.',
      scope: '.',
      icons: [
        { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    generateSW: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,webmanifest}'],
      // service worker di sicurezza per la vecchia app Angular: non va messo in cache
      globIgnores: ['ngsw-worker.js'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      type: 'module',
    },
  },

  eslint: {
    config: { stylistic: false },
  },

  typescript: {
    strict: true,
  },
})
