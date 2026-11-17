---
type: C4 Component
title: Ricorrenze e statistiche
status: stable
groma:
  id: ricorrenze
  parent: web-app
  code:
    - scanner: typescript
      file: shared/utils/recurrence.ts
    - scanner: vue
      file: shared/utils/recurrence.ts
  technology: TypeScript (puro)
  group: Dominio
description: 'Il motore di dominio: cosa è previsto, cosa è fatto, che serie c''è'
---

Decide se un'attività è prevista in un giorno (giornaliera, giorni della settimana, ogni N giorni, N volte a settimana, mensile, nessuna) e quando un valore la completa rispetto all'obiettivo. Calcola l'avanzamento, il piano del giorno e le statistiche: serie attuale e record, in giorni o settimane, e tasso di completamento. Non dipende né da Vue né dal database ed è coperto dai test Vitest.
