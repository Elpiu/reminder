---
type: C4 System
title: IndexedDB del browser
status: stable
groma:
  id: indexeddb-del-browser
  technology: IndexedDB
---

Archivio del browser in cui la Web app salva tutti i dati (database `reminder-v2`): attività, voci, inbox, tag, foto e preferenze. I dati appartengono all'app ma vivono solo su questo dispositivo; si spostano solo tramite il backup JSON. Contiene anche, in sola lettura per la migrazione, il database `reminder` della versione precedente.
