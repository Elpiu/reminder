---
type: C4 Component
title: Guida installazione
status: stable
groma:
  id: guida-installazione
  parent: web-app
  code:
    - scanner: vue
      file: app/components/InstallGuide.vue
  technology: Vue, @vite-pwa/nuxt
  group: Interfaccia condivisa
description: Spiega come installare la PWA sul dispositivo
---

Se il browser lo permette mostra il pulsante di installazione nativo; altrimenti dà le istruzioni per iOS (Safari, Condividi) o Android. Rileva quando l'app è già installata. È usata dal primo avvio e dalle impostazioni.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/components/InstallGuide.vue](../../../../../../app/components/InstallGuide.vue) | [sistema-del-dispositivo](../../../../../externals/sistema-del-dispositivo.md) | Avvia l'installazione | beforeinstallprompt |
