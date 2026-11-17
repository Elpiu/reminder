---
type: C4 Component
title: Errori traducibili
status: stable
groma:
  id: errori
  parent: web-app
  code:
    - scanner: typescript
      file: shared/utils/errors.ts
      symbol: AppError
    - scanner: vue
      file: shared/utils/errors.ts
  technology: TypeScript
  group: Dominio
description: Errori con un codice invece di un testo
---

`AppError` porta un codice (es. `backup.invalidFile`, `photo.notImage`) e dei parametri. La logica condivisa e le utilità lanciano questi errori senza conoscere la lingua; le schermate li mostrano tradotti tramite Lingua e formati.
