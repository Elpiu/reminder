---
type: C4 Component
title: Badge e notifiche
status: stable
groma:
  id: badge-notifiche
  parent: web-app
  code:
    - scanner: typescript
      file: app/composables/useBadgeSync.ts
      symbol: useBadgeSync
    - scanner: vue
      file: app/composables/useBadgeSync.ts
  technology: Badging API, Notifications API
  group: Dati locali
description: Ricorda cosa resta da fare senza un server
---

Tiene aggiornato il numero sull'icona dell'app installata con le attività previste non completate e i promemoria di oggi. Se l'utente l'ha abilitata, mostra una notifica locale quando l'app viene aperta o torna in primo piano. Le notifiche a orario non sono possibili senza un server push.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/composables/useBadgeSync.ts](../../../../../../app/composables/useBadgeSync.ts) | [app/composables/useData.ts](../../../../../../app/composables/useData.ts) | Conta le cose da fare | usePendingToday |
| [app/composables/useBadgeSync.ts](../../../../../../app/composables/useBadgeSync.ts) | [sistema-del-dispositivo](../../../../../externals/sistema-del-dispositivo.md) | Aggiorna badge e notifiche | Badging API, Notifications API |
