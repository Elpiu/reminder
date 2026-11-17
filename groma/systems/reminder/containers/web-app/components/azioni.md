---
type: C4 Component
title: Azioni
status: stable
groma:
  id: azioni
  parent: web-app
  code:
    - scanner: typescript
      file: app/utils/actions.ts
    - scanner: vue
      file: app/utils/actions.ts
  technology: TypeScript, Dexie
  group: Dati locali
description: Unico punto di scrittura sui dati
---

Crea, modifica, archivia, riordina ed elimina le attività. Imposta e incrementa i valori, con una sola voce per attività e giorno, in transazioni che non perdono i tap rapidi. Crea e modifica le note, completa gli elementi dell'inbox trasformandoli in note, gestisce i tag. Le eliminazioni conservano una copia dei dati e mostrano un toast "Annulla" che li ripristina. I dati vengono copiati come JSON semplice, perché gli oggetti reattivi di Vue non sono clonabili.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/utils/actions.ts](../../../../../../app/utils/actions.ts) | [app/utils/db.ts](../../../../../../app/utils/db.ts) | Scrive nelle tabelle | Transazioni Dexie |
