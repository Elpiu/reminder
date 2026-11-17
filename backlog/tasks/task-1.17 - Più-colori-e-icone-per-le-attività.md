---
id: TASK-1.17
title: Più colori e icone per le attività
status: Done
assignee:
  - '@claude'
created_date: '2026-11-17T15:24:00Z'
updated_date: '2026-11-17T15:24:00Z'
labels:
  - v2
dependencies: []
modified_files:
  - shared/utils/catalog.ts
  - shared/types/models.ts
  - shared/utils/backup.ts
  - app/components/AppearancePicker.vue
  - app/components/ActivityEditor.vue
  - app/components/ActivityIcon.vue
  - app/components/ActivityRow.vue
  - app/pages/andamento/index.vue
  - app/pages/andamento/[id].vue
  - tests/backup.test.ts
parent_task_id: TASK-1
type: enhancement
ordinal: 18000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Con 12 colori e 60 icone la personalizzazione delle attività era limitata; l'utente ha chiesto più varietà.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Palette di almeno 36 colori più un colore personalizzato
- [x] #2 Oltre 200 icone divise per categoria
- [x] #3 Attività esistenti e backup con i vecchi colori restano validi
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verificato nel browser: 38 colori + personalizzato (salvato #e11d48), 12 categorie di icone renderizzate; corretto un fieldset che si allargava oltre lo schermo. Test sulla validazione colori e sul backup.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Nuovo selettore aspetto: 19 tinte in tono vivo e scuro, colore personalizzato con UColorPicker, 234 icone Lucide in 12 categorie (290 icone totali nel bundle, 92 KB). Colori salvati come chiave della palette o #rrggbb, risolti da activityColor(); le vecchie chiavi restano valide.
<!-- SECTION:FINAL_SUMMARY:END -->
