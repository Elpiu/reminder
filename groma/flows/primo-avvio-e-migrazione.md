---
type: Groma Flow
title: Primo avvio e migrazione
groma:
  id: primo-avvio-e-migrazione
---

Alla prima apertura il middleware controlla le preferenze; se sul dispositivo c'è il database della vecchia app lo converte in automatico, altrimenti l'utente sceglie i pacchetti di attività nel benvenuto.

## Steps

| From | To | Action |
| --- | --- | --- |
| [Utente](../actors/utente.md) | [Primo avvio](../systems/reminder/containers/web-app/components/primo-avvio.md) | Apre l'app per la prima volta |
| [Primo avvio](../systems/reminder/containers/web-app/components/primo-avvio.md) | [Preferenze](../systems/reminder/containers/web-app/components/preferenze.md) | Verifica se il primo avvio è completato |
| [Primo avvio](../systems/reminder/containers/web-app/components/primo-avvio.md) | [Backup e migrazione](../systems/reminder/containers/web-app/components/backup.md) | Cerca e converte i dati v1 |
| [Backup e migrazione](../systems/reminder/containers/web-app/components/backup.md) | [IndexedDB del browser](../externals/indexeddb-del-browser.md) | Legge il vecchio database |
| [Backup e migrazione](../systems/reminder/containers/web-app/components/backup.md) | [Schema del database](../systems/reminder/containers/web-app/components/schema-database.md) | Sostituisce i dati con quelli convertiti |
| [Primo avvio](../systems/reminder/containers/web-app/components/primo-avvio.md) | [Catalogo](../systems/reminder/containers/web-app/components/catalogo.md) | Mostra i pacchetti |
| [Primo avvio](../systems/reminder/containers/web-app/components/primo-avvio.md) | [Azioni](../systems/reminder/containers/web-app/components/azioni.md) | Crea le attività scelte |
