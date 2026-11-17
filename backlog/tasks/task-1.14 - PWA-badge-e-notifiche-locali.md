---
id: TASK-1.14
title: PWA, badge e notifiche locali
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-17T14:09:00Z'
updated_date: '2026-11-17T14:56:00Z'
labels:
  - v2
dependencies:
  - TASK-1.1
  - TASK-1.3
parent_task_id: TASK-1
type: feature
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Senza server non si possono programmare notifiche affidabili; usiamo badge e notifiche all'apertura.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Manifest, service worker autoUpdate, funzionamento offline
- [ ] #2 Badge con numero di attività dovute oggi non completate
- [ ] #3 Notifica locale opzionale all'apertura se ci sono attività dovute
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Build: manifest linkato, sw.js con precache di HTML/JS/CSS/font/icone e NavigationRoute su /reminder/. Il browser integrato usato per i test rifiuta la registrazione del SW, quindi offline, badge e notifica NON sono verificati: provare su Android/iOS dopo il deploy.
<!-- SECTION:NOTES:END -->
