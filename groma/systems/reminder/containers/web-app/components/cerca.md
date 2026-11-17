---
type: C4 Component
title: Ricerca
status: stable
groma:
  id: cerca
  parent: web-app
  code:
    - scanner: vue
      file: app/pages/cerca.vue
  technology: Vue
  group: Schermate
description: Ritrova voci passate per testo, attività, tag e periodo
---

Filtra in memoria tutte le voci (senza distinguere accenti e maiuscole) e raggruppa i risultati per giorno. Le note si aprono nell'editor del diario; le registrazioni delle attività portano al loro andamento. Può essere aperta già filtrata per tag, dai chip dei tag.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/pages/cerca.vue](../../../../../../app/pages/cerca.vue) | [app/composables/useData.ts](../../../../../../app/composables/useData.ts) | Legge voci e tag | useLiveQuery |
