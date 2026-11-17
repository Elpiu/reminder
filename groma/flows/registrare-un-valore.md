---
type: Groma Flow
title: Registrare un valore
groma:
  id: registrare-un-valore
---

L'utente apre la giornata, vede le attività previste e ne registra una con un tap: il valore passa dalle Azioni al database locale e la vista si aggiorna da sola tramite le letture reattive.

## Steps

| From | To | Action |
| --- | --- | --- |
| [Utente](../actors/utente.md) | [Vista giorno](../systems/reminder/containers/web-app/components/vista-giorno.md) | Apre la giornata |
| [Vista giorno](../systems/reminder/containers/web-app/components/vista-giorno.md) | [Letture reattive](../systems/reminder/containers/web-app/components/letture-reattive.md) | Chiede il piano del giorno |
| [Letture reattive](../systems/reminder/containers/web-app/components/letture-reattive.md) | [Ricorrenze e statistiche](../systems/reminder/containers/web-app/components/ricorrenze.md) | Calcola previste, facoltative e avanzamento |
| [Vista giorno](../systems/reminder/containers/web-app/components/vista-giorno.md) | [Registrazione attività](../systems/reminder/containers/web-app/components/registrazione-attivita.md) | Mostra una riga per attività |
| [Registrazione attività](../systems/reminder/containers/web-app/components/registrazione-attivita.md) | [Azioni](../systems/reminder/containers/web-app/components/azioni.md) | Salva il valore (tap o foglio) |
| [Azioni](../systems/reminder/containers/web-app/components/azioni.md) | [Schema del database](../systems/reminder/containers/web-app/components/schema-database.md) | Scrive la voce in una transazione |
| [Schema del database](../systems/reminder/containers/web-app/components/schema-database.md) | [IndexedDB del browser](../externals/indexeddb-del-browser.md) | Persiste sul dispositivo |
