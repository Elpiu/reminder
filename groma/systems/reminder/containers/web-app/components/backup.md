---
type: C4 Component
title: Backup e migrazione
status: stable
groma:
  id: backup
  parent: web-app
  code:
    - scanner: typescript
      file: app/utils/backupIO.ts
    - scanner: vue
      file: app/utils/backupIO.ts
    - scanner: typescript
      file: shared/utils/backup.ts
    - scanner: vue
      file: shared/utils/backup.ts
  technology: TypeScript, JSON
  group: Dati locali
description: Esporta, importa, resetta e converte i dati della v1
---

La parte pura valida i backup `version: 2` e converte quelli `version: 1` della vecchia app: note → voci, template → attività, todo → inbox, categorie → tag. La parte di I/O scarica il JSON, con le foto facoltative come data URL, sostituisce tutti i dati in una transazione, fa il reset e, una sola volta per dispositivo, legge il vecchio database idb-keyval per la migrazione automatica.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/utils/backupIO.ts](../../../../../../app/utils/backupIO.ts) | [app/utils/db.ts](../../../../../../app/utils/db.ts) | Sostituisce i dati | Transazione Dexie |
| [app/utils/backupIO.ts](../../../../../../app/utils/backupIO.ts) | [indexeddb-del-browser](../../../../../externals/indexeddb-del-browser.md) | Legge il database v1 | IndexedDB |
