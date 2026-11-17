---
type: C4 Component
title: Configurazione e tema
status: stable
groma:
  id: configurazione
  parent: web-app
  code:
    - scanner: typescript
      file: nuxt.config.ts
    - scanner: vue
      file: nuxt.config.ts
    - scanner: typescript
      file: app/app.config.ts
    - scanner: vue
      file: app/app.config.ts
  technology: Nuxt config, Tailwind CSS v4
description: Configurazione Nuxt, PWA e tema
---

Configura la modalità SPA, il base URL (per GitHub Pages), l'head e il manifest. Imposta il service worker con precache e fallback di navigazione, i colori primary teal e neutral stone, le icone incluse nel bundle senza API esterne e i font locali.
