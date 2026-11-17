---
type: C4 Component
title: Shell dell'app
status: stable
groma:
  id: app-shell
  parent: web-app
  code:
    - scanner: vue
      file: app/app.vue
    - scanner: vue
      file: app/layouts/default.vue
    - scanner: vue
      file: app/layouts/bare.vue
    - scanner: vue
      file: app/components/AppHeader.vue
    - scanner: vue
      file: app/components/BottomNav.vue
  technology: Vue, Nuxt UI
  group: Interfaccia condivisa
description: Cornice comune a tutte le schermate
---

Monta `UApp` con la lingua scelta (anche per i componenti Nuxt UI), il sistema di toast e overlay e l'attributo `lang` della pagina, avvia la sincronizzazione del badge e sceglie il layout: `default` con la barra di navigazione in basso (Oggi, Calendario, Andamento, Inbox, con il contatore dell'inbox) oppure `bare` per il primo avvio. L'intestazione sticky di ogni pagina offre ricerca e impostazioni e rispetta le safe area di iOS.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/app.vue](../../../../../../app/app.vue) | [app/composables/useBadgeSync.ts](../../../../../../app/composables/useBadgeSync.ts) | Avvia il badge | Composable Vue |
