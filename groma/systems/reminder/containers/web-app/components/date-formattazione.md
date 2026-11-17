---
type: C4 Component
title: Date e formattazione
status: stable
groma:
  id: date-formattazione
  parent: web-app
  code:
    - scanner: typescript
      file: shared/utils/dates.ts
    - scanner: vue
      file: shared/utils/dates.ts
    - scanner: typescript
      file: shared/utils/format.ts
    - scanner: vue
      file: shared/utils/format.ts
  technology: TypeScript, Intl
  group: Dominio
description: Chiavi giorno locali e testi in italiano
---

Gestisce le chiavi `YYYY-MM-DD` locali (a mezzogiorno, per evitare problemi col cambio d'ora), l'aritmetica dei giorni, le griglie della settimana e del mese. Formatta valori, durate, date e mesi con `Intl` nella lingua ricevuta come parametro; le etichette come "Oggi" o "Ieri" le fornisce chi chiama.
