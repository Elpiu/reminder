---
type: C4 Component
title: Vista giorno
status: stable
groma:
  id: vista-giorno
  parent: web-app
  code:
    - scanner: vue
      file: app/pages/index.vue
    - scanner: vue
      file: app/components/WeekStrip.vue
  technology: Vue
  group: Schermate
description: 'Schermata principale: cosa fare e cosa è successo in un giorno'
---

È la home (`/`) e mostra anche qualsiasi altro giorno con `?d=YYYY-MM-DD`. Una striscia della settimana, sfogliabile con swipe o frecce, mostra l'anello di completamento di ogni giorno. Sotto ci sono le attività previste con la barra di avanzamento, i promemoria dell'inbox in scadenza, le attività facoltative ("Registra anche") e il diario del giorno con il campo per la nota veloce. Il piano del giorno arriva da Letture reattive, che usa il motore delle Ricorrenze.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/pages/index.vue](../../../../../../app/pages/index.vue) | [app/composables/useData.ts](../../../../../../app/composables/useData.ts) | Legge il piano del giorno | useDay |
| [app/pages/index.vue](../../../../../../app/pages/index.vue) | [app/components/ActivityRow.vue](../../../../../../app/components/ActivityRow.vue) | Mostra le attività | Componente Vue |
| [app/pages/index.vue](../../../../../../app/pages/index.vue) | [app/components/QuickAdd.vue](../../../../../../app/components/QuickAdd.vue) | Ospita la nota veloce | Componente Vue |
| [app/pages/index.vue](../../../../../../app/pages/index.vue) | [app/components/InboxRow.vue](../../../../../../app/components/InboxRow.vue) | Mostra i promemoria | Componente Vue |
