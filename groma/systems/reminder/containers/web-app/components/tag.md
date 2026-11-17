---
type: C4 Component
title: Tag
status: stable
groma:
  id: tag
  parent: web-app
  code:
    - scanner: vue
      file: app/pages/impostazioni/tag.vue
    - scanner: vue
      file: app/components/TagChips.vue
    - scanner: vue
      file: app/components/TagPicker.vue
  technology: Vue, Nuxt UI SelectMenu
  group: Inserimento e modifica
description: 'Unico sistema di classificazione: crea, assegna, rinomina, elimina'
---

Il selettore dei tag, usato da note, inbox e attività, crea i tag al volo; i chip li mostrano e portano alla ricerca filtrata. La pagina dei tag ne mostra l'uso, li rinomina e li elimina: dopo una conferma il tag viene tolto da tutte le voci.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/pages/impostazioni/tag.vue](../../../../../../app/pages/impostazioni/tag.vue) | [app/utils/actions.ts](../../../../../../app/utils/actions.ts) | Rinomina ed elimina tag | Chiamata di funzione |
