---
id: TASK-1.16
title: Curare la mappa architetturale groma
status: Done
assignee:
  - '@claude'
created_date: '2026-11-17T15:14:00Z'
updated_date: '2026-11-17T15:14:00Z'
labels:
  - v2
  - architettura
dependencies: []
references:
  - web-app
  - utente
  - indexeddb-del-browser
  - sistema-del-dispositivo
modified_files:
  - groma/config.json
parent_task_id: TASK-1
type: docs
ordinal: 17000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Il primo scan di groma produceva 56 componenti uno-per-file senza descrizioni, utili solo come elenco di file. L'utente ha chiesto di curarla per renderla leggibile a chi arriva sul progetto.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Strumenti di sviluppo e test esclusi dalla mappa
- [x] #2 Componenti uniti per responsabilità, con titoli e descrizioni in italiano
- [x] #3 Attore, sistemi esterni, relazioni e flussi principali dichiarati
- [x] #4 Due scan consecutivi non creano nuovi componenti
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Contenitore Web app dichiarato come draft: gli scanner groma (typescript, vue) non riportano punti d'ingresso Nuxt, quindi non può essere 'matched' e accettato. IndexedDB modellato come sistema esterno perché un contenitore senza codice non può essere estremo di relazioni. groma lint segnala 2 possibili duplicati (gestori swipe in WeekStrip/calendario, onImport in benvenuto/impostazioni).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Mappa groma curata: 27 componenti (da 56) in 5 gruppi dentro il contenitore Web app, attore Utente, esterni IndexedDB e Sistema del dispositivo, 51 relazioni e 4 flussi (registrare un valore, nota con foto, primo avvio e migrazione, badge). Stabile su due scan consecutivi.
<!-- SECTION:FINAL_SUMMARY:END -->
