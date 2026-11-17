---
id: TASK-1.18
title: Deploy automatico su GitHub Pages
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-17T15:24:00Z'
updated_date: '2026-11-17T15:35:00Z'
labels:
  - v2
  - deploy
dependencies: []
modified_files:
  - .github/workflows/deploy.yml
  - public/ngsw-worker.js
  - nuxt.config.ts
parent_task_id: TASK-1
type: chore
ordinal: 19000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
La pubblicazione era manuale (pnpm build-and-publish); l'utente vuole che ogni push su master pubblichi l'app.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Workflow GitHub Actions che a ogni push su master esegue test, lint e build con base /reminder/
- [x] #2 La build viene pubblicata sul branch gh-pages
- [ ] #3 Chi aveva la v1 installata passa alla nuova app senza restare bloccato sulla cache Angular
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Build identica a quella del workflow verificata in locale. DA VERIFICARE dopo il primo push: esito del workflow, contenuto del branch gh-pages, aggiornamento di un dispositivo che aveva la v1.

Primo deploy riuscito: run https://github.com/Elpiu/reminder/actions/runs/44114580583, sito live con gli asset /reminder/_nuxt. Resta da verificare l'aggiornamento su un dispositivo con la v1.
<!-- SECTION:NOTES:END -->
