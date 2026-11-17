---
type: C4 Component
title: Ritiro del service worker v1
status: stable
groma:
  id: ritiro-sw-v1
  parent: web-app
  code:
    - scanner: vue
      file: public/ngsw-worker.js
  technology: Service Worker
description: Disinstalla il service worker della vecchia app Angular
---

Pubblicato come `ngsw-worker.js`, lo stesso nome del service worker Angular. Quando un browser che aveva la v1 controlla gli aggiornamenti scarica questo file, che cancella le cache `ngsw:`, si disinstalla e ricarica le pagine aperte. Al nuovo caricamento parte la Web app, che registra il proprio service worker e, al primo avvio, migra i dati. Non tocca IndexedDB ed è escluso dalla precache.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [public/ngsw-worker.js](../../../../../../public/ngsw-worker.js) | [sistema-del-dispositivo](../../../../../externals/sistema-del-dispositivo.md) | Ricarica le pagine aperte | Service Worker API |
