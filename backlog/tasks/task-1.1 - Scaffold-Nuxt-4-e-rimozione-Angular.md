---
id: TASK-1.1
title: Scaffold Nuxt 4 e rimozione Angular
status: Done
assignee:
  - '@claude'
created_date: '2026-11-17T14:09:00Z'
updated_date: '2026-11-17T14:56:00Z'
labels:
  - v2
dependencies: []
parent_task_id: TASK-1
type: chore
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Base del nuovo stack (Bookpack): Nuxt 4 SPA, Nuxt UI v4, Tailwind v4 solo CSS, font e icone locali, pnpm.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Angular e PrimeNG rimossi dal repo
- [x] #2 pnpm dev e pnpm generate funzionano
- [x] #3 Font Inter/Literata e icone Lucide servite senza richieste di rete
- [x] #4 Tema teal/stone con override --ui-bg/--ui-primary chiaro e scuro
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Rimuovere sorgenti e config Angular
2. package.json pnpm con Nuxt 4, Nuxt UI 4, Tailwind 4, Dexie, vite-pwa, fontsource, iconify lucide
3. nuxt.config SPA, app.config colori, main.css con theme e override
4. Verificare dev/generate
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verificato: dev server e generate (anche con base /reminder/) funzionano; font woff2 e 131 icone Lucide nel bundle, nessun fetch a CDN (le URL iconify nel bundle sono costanti di libreria, provider none + fallbackToApi false). Nota Windows: in Git Bash usare MSYS_NO_PATHCONV=1 con NUXT_APP_BASE_URL.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Angular/PrimeNG rimossi; scaffold Nuxt 4 SPA + Nuxt UI 4 + Tailwind 4 (solo CSS) + Dexie + vite-pwa, pnpm 11, font e icone locali, tema teal/stone con override chiaro/scuro. Typecheck, lint e build ok.
<!-- SECTION:FINAL_SUMMARY:END -->
