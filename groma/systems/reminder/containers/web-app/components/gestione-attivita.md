---
type: C4 Component
title: Gestione attività
status: stable
groma:
  id: gestione-attivita
  parent: web-app
  code:
    - scanner: vue
      file: app/components/ActivityEditor.vue
    - scanner: vue
      file: app/pages/impostazioni/attivita.vue
  technology: Vue, Nuxt UI Modal
  group: Inserimento e modifica
description: Crea e configura cosa tracciare
---

L'editor imposta nome, icona e colore, tipo di valore, unità, obiettivo, ricorrenza (giorni, volte a settimana, ogni N giorni, mensile, nessuna), orario indicativo, data di inizio e tag. La pagina in Impostazioni elenca le attività attive e archiviate, permette di riordinarle e di aggiungere quelle dei pacchetti pronti del Catalogo.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/components/ActivityEditor.vue](../../../../../../app/components/ActivityEditor.vue) | [app/utils/actions.ts](../../../../../../app/utils/actions.ts) | Salva l'attività | Chiamata di funzione |
| [app/pages/impostazioni/attivita.vue](../../../../../../app/pages/impostazioni/attivita.vue) | [shared/utils/catalog.ts](../../../../../../shared/utils/catalog.ts) | Aggiunge i pacchetti | Import |
