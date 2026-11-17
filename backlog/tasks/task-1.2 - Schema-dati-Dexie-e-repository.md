---
id: TASK-1.2
title: Schema dati Dexie e repository
status: Done
assignee: []
created_date: '2026-11-17T14:09:00Z'
updated_date: '2026-11-17T14:56:00Z'
labels:
  - v2
dependencies:
  - TASK-1.1
parent_task_id: TASK-1
type: feature
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Nuovo modello: attività, voci (valore o nota con foto), inbox, tag, impostazioni. Le categorie non esistono più.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Database Dexie con tabelle activities, entries, inbox, tags, photos, settings
- [x] #2 Le viste si aggiornano in tempo reale tramite liveQuery
- [x] #3 Eliminare un tag lo rimuove da voci, inbox e attività
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verificato nel browser: DB reminder-v2 con tutte le tabelle; la UI si aggiorna via liveQuery; eliminando un tag con conferma il riferimento sparisce dalle voci.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Schema Dexie (activities, entries, inbox, tags, photos, settings), azioni centralizzate in app/utils/actions.ts con Annulla, letture reattive con useLiveQuery. Corretto un race sul contatore (lettura+scrittura in transazione) e la copia di oggetti reattivi (plain() al posto di structuredClone).
<!-- SECTION:FINAL_SUMMARY:END -->
