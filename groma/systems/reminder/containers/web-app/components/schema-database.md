---
type: C4 Component
title: Schema del database
status: stable
groma:
  id: schema-database
  parent: web-app
  code:
    - scanner: typescript
      file: app/utils/db.ts
    - scanner: vue
      file: app/utils/db.ts
  technology: Dexie
  group: Dati locali
description: Definizione Dexie del database locale
---

Dichiara il database `reminder-v2` con le tabelle attività, voci (indicizzate per data, attività, attività+giorno e tag), inbox, tag, foto e impostazioni. Fornisce l'istanza condivisa e gli ID generati sul client.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/utils/db.ts](../../../../../../app/utils/db.ts) | [indexeddb-del-browser](../../../../../externals/indexeddb-del-browser.md) | Persiste i dati | Dexie |
