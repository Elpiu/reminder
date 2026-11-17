---
type: C4 Component
title: Calendario
status: stable
groma:
  id: calendario
  parent: web-app
  code:
    - scanner: vue
      file: app/pages/calendario.vue
  technology: Vue
  group: Schermate
description: Vista mensile per orientarsi nel tempo
---

Griglia del mese, sfogliabile con swipe o frecce, con l'anello di completamento di ogni giorno passato e i segni per note e foto. Un tap su un giorno apre la vista giorno. In fondo il riepilogo del mese: giorni completi e note.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/pages/calendario.vue](../../../../../../app/pages/calendario.vue) | [shared/utils/recurrence.ts](../../../../../../shared/utils/recurrence.ts) | Calcola i giorni completi | Chiamata di funzione |
| [app/pages/calendario.vue](../../../../../../app/pages/calendario.vue) | [app/composables/useData.ts](../../../../../../app/composables/useData.ts) | Legge le attività | useActivities |
