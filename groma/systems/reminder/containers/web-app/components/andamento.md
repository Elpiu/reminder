---
type: C4 Component
title: Andamento
status: stable
groma:
  id: andamento
  parent: web-app
  code:
    - scanner: vue
      file: app/pages/andamento/index.vue
    - scanner: vue
      file: app/pages/andamento/[id].vue
    - scanner: vue
      file: app/components/Heatmap.vue
    - scanner: vue
      file: app/components/BarChart.vue
  technology: Vue, SVG
  group: Schermate
description: Statistiche e progressi delle attività
---

Il riepilogo mostra completamento, serie migliore e numero di note nel periodo scelto (7 giorni, 30 giorni, 3 mesi, anno), e per ogni attività percentuale, serie e mappa di 17 settimane. Il dettaglio di un'attività aggiunge serie attuale e record, mappa annuale, grafico a barre dei valori con la linea dell'obiettivo, distribuzione delle scelte e registrazioni recenti, più le azioni modifica, archivia ed elimina. I calcoli vengono dalle Ricorrenze.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/pages/andamento/index.vue](../../../../../../app/pages/andamento/index.vue) | [app/composables/useData.ts](../../../../../../app/composables/useData.ts) | Legge le attività | useActivities |
| [app/pages/andamento/index.vue](../../../../../../app/pages/andamento/index.vue) | [shared/utils/recurrence.ts](../../../../../../shared/utils/recurrence.ts) | Calcola le statistiche | Chiamata di funzione |
