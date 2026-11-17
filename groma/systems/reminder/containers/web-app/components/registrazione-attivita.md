---
type: C4 Component
title: Registrazione attività
status: stable
groma:
  id: registrazione-attivita
  parent: web-app
  code:
    - scanner: vue
      file: app/components/ActivityRow.vue
    - scanner: vue
      file: app/components/ValueSheet.vue
  technology: Vue, Nuxt UI Drawer
  group: Inserimento e modifica
description: Registra il valore di un'attività in uno o due tap
---

Ogni riga ha il controllo rapido adatto al tipo di valore: spunta per sì/no, +/− per i contatori, scelte e livelli direttamente nella riga. Numero, durata e testo aprono un foglio dal basso, dove si può aggiungere un commento o cancellare il valore. Avanzamento e completamento vengono dalle Ricorrenze; il salvataggio passa dalle Azioni.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/components/ActivityRow.vue](../../../../../../app/components/ActivityRow.vue) | [app/utils/actions.ts](../../../../../../app/utils/actions.ts) | Salva i valori | Chiamata di funzione |
| [app/components/ActivityRow.vue](../../../../../../app/components/ActivityRow.vue) | [shared/utils/recurrence.ts](../../../../../../shared/utils/recurrence.ts) | Calcola l'avanzamento | Chiamata di funzione |
| [app/components/ActivityRow.vue](../../../../../../app/components/ActivityRow.vue) | [app/components/ActivityIcon.vue](../../../../../../app/components/ActivityIcon.vue) | Mostra l'icona | Componente Vue |
