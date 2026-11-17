---
id: TASK-1.4
title: Backup v2 e migrazione dal backup v1
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-17T14:09:00Z'
updated_date: '2026-11-17T14:56:00Z'
labels:
  - v2
dependencies:
  - TASK-1.2
parent_task_id: TASK-1
type: feature
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
I dati restano solo locali, quindi il backup JSON è l'unico modo per spostarli; gli utenti attuali hanno backup v1 da importare.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Export JSON v2 con opzione per includere le foto
- [ ] #2 Import v2 sostituisce i dati dopo conferma
- [x] #3 Import v1 converte note->voci, template->attività, todo->inbox, categorie->tag
- [ ] #4 Reset con conferma esplicita
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementato export (con/senza foto), import v1/v2 con conferma, reset, migrazione automatica dal DB idb-keyval della v1. Verificato con test la conversione v1 e il round trip v2. DA VERIFICARE a mano: download dell'export, import di un file reale, reset.
<!-- SECTION:NOTES:END -->
