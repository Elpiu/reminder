---
id: TASK-1.5
title: 'Shell mobile: header, bottom nav, tema, scala testo'
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
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
La v1 aveva layout desktop a due colonne e navigazione in alto, scomoda su telefono.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Bottom nav Oggi/Calendario/Andamento/Inbox e header sticky con blur
- [x] #2 Safe area iOS e viewport-fit=cover
- [x] #3 Tema chiaro/scuro/sistema e dimensione testo dalle impostazioni
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verificato: bottom nav e header sticky; meta viewport-fit=cover nel build e padding env(safe-area-inset-*); tema chiaro/scuro; dimensione testo (--app-scale 1.12 su Grande). Non provato su un iPhone reale.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Layout mobile con header sticky blur, bottom nav con badge inbox, safe area iOS, tema sistema/chiaro/scuro e scala del testo dalle impostazioni.
<!-- SECTION:FINAL_SUMMARY:END -->
