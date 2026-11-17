---
type: C4 Component
title: Modello dati
status: stable
groma:
  id: modello-dati
  parent: web-app
  code:
    - scanner: typescript
      file: shared/types/models.ts
    - scanner: vue
      file: shared/types/models.ts
  technology: TypeScript
  group: Dominio
description: Tipi delle entità persistite e del backup
---

Definisce attività, ricorrenza, obiettivo, voce, elemento dell'inbox, tag, foto, preferenze e il formato di backup v2. È condiviso da app, logica di dominio e test.
