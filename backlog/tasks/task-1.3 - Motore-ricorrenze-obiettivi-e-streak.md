---
id: TASK-1.3
title: Motore ricorrenze, obiettivi e streak
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
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
I ricorrenti v1 erano template copiati a mano; serve sapere cosa è dovuto in un giorno. Logica pura e testata.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Supporta ogni giorno, giorni della settimana, ogni N giorni, N volte a settimana, giorno del mese, nessuna
- [x] #2 Calcola completamento rispetto all'obiettivo per ogni tipo di valore
- [x] #3 Calcola streak corrente e migliore
- [x] #4 Test Vitest coprono i casi principali
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
shared/utils/recurrence.ts: isScheduledOn, isComplete, progressOf, planDay, activityStats, streaks. 21 test Vitest verdi (ricorrenze, obiettivi, serie, weekly, date).
<!-- SECTION:FINAL_SUMMARY:END -->
