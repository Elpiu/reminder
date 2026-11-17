---
id: TASK-1.19
title: Interfaccia in italiano e inglese con scelta della lingua
status: Done
assignee:
  - '@claude'
created_date: '2026-11-17T15:52:00Z'
updated_date: '2026-11-17T15:53:00Z'
labels:
  - v2
  - i18n
dependencies: []
parent_task_id: TASK-1
type: feature
ordinal: 20000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
L'app era solo in italiano; l'utente vuole il supporto i18n con la scelta della lingua, e screenshot aggiornati per il repository.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Tutti i testi dell'interfaccia vengono dai file di traduzione it/en
- [x] #2 La lingua iniziale segue il browser e si cambia da impostazioni e benvenuto, restando salvata
- [x] #3 Date, numeri, ricorrenze, errori e pacchetti iniziali sono nella lingua scelta
- [x] #4 README aggiornato con screenshot delle schermate principali
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verifica: 337 chiavi usate nel codice presenti in entrambe le lingue (script di controllo); nessun testo italiano rimasto nei template; nel browser il passaggio a English aggiorna testi, titolo, lang=en e cookie reminder_lang. Screenshot da dati di esempio (45 giorni) in img/.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
@nuxtjs/i18n con strategia no_prefix, it (predefinita) ed en, rilevamento della lingua del browser e cookie. useFmt centralizza date, valori, ricorrenze, tipi, colori ed errori; shared/ non contiene più testi (codici AppError, streakUnit days/weeks, chiavi per pacchetti, icone e colori). LanguagePicker in impostazioni e benvenuto. README con galleria di 7 screenshot.
<!-- SECTION:FINAL_SUMMARY:END -->
