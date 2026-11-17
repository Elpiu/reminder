---
type: C4 Container
title: Web app
description: La PWA installabile che l'utente apre sul telefono
status: draft
groma:
  id: web-app
  parent: reminder
  technology: Nuxt 4 SPA, Vue 3.5, Nuxt UI v4, Tailwind CSS v4, Dexie, Workbox
---

Applicazione a pagina singola Nuxt generata in statico (`nuxt generate`) e servita da GitHub Pages sotto `/reminder/`. Un service worker generato da vite-pwa mette in cache HTML, JS, CSS, font e icone, quindi dopo la prima visita l'app si apre anche offline.

Non c'è backend: tutta la logica gira nel browser. Le schermate leggono con query reattive Dexie e scrivono solo tramite le Azioni; la logica di dominio (ricorrenze, statistiche, backup) è pura e coperta da test.

Lo stato `draft` del contenitore dipende dal fatto che gli scanner di groma non riconoscono ancora i punti d'ingresso di Nuxt: l'applicazione esiste ed è in produzione.
