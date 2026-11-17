---
type: C4 Component
title: Preferenze
status: stable
groma:
  id: preferenze
  parent: web-app
  code:
    - scanner: typescript
      file: app/composables/usePreferences.ts
    - scanner: vue
      file: app/composables/usePreferences.ts
  technology: Vue, Dexie
  group: Dati locali
description: Impostazioni dell'utente persistite
---

Carica e salva le preferenze (primo avvio completato, dimensione del testo, inizio settimana, badge, notifica all'apertura) nella tabella `settings`. Applica la dimensione del testo tramite la variabile CSS `--app-scale` sulla radice, e tutta l'interfaccia scala perché è in rem.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/composables/usePreferences.ts](../../../../../../app/composables/usePreferences.ts) | [app/utils/db.ts](../../../../../../app/utils/db.ts) | Salva le impostazioni | Dexie |
