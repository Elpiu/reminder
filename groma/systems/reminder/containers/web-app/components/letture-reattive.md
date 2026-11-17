---
type: C4 Component
title: Letture reattive
status: stable
groma:
  id: letture-reattive
  parent: web-app
  code:
    - scanner: typescript
      file: app/composables/useLiveQuery.ts
      symbol: useLiveQuery
    - scanner: vue
      file: app/composables/useLiveQuery.ts
    - scanner: typescript
      file: app/composables/useData.ts
    - scanner: vue
      file: app/composables/useData.ts
  technology: Dexie liveQuery, Vue
  group: Dati locali
description: Query che aggiornano da sole le schermate
---

`useLiveQuery` ri-esegue una query Dexie quando cambiano i dati o i parametri reattivi. Sopra ci sono le letture di dominio: attività, tag, inbox e `useDay`, che per un giorno calcola il piano (previste e facoltative), le note, i promemoria e l'avanzamento della settimana usando le Ricorrenze, più il numero di cose ancora da fare oggi.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/composables/useData.ts](../../../../../../app/composables/useData.ts) | [shared/utils/recurrence.ts](../../../../../../shared/utils/recurrence.ts) | Pianifica il giorno | planDay |
| [app/composables/useData.ts](../../../../../../app/composables/useData.ts) | [app/utils/db.ts](../../../../../../app/utils/db.ts) | Interroga le tabelle | Dexie liveQuery |
