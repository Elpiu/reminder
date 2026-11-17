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

Gestisce le chiavi `YYYY-MM-DD` locali (a mezzogiorno, per evitare problemi col cambio d'ora), l'aritmetica dei giorni, le griglie della settimana e del mese. Formatta in italiano i valori ("1 h 30 min", "8 bicchieri") e i titoli dei giorni ("Oggi", "Ieri", "Martedì 17 novembre").
