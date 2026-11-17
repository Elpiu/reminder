---
type: C4 Component
title: Diario
status: stable
groma:
  id: diario
  parent: web-app
  code:
    - scanner: vue
      file: app/components/NoteEditor.vue
    - scanner: vue
      file: app/components/EntryCard.vue
    - scanner: vue
      file: app/components/QuickAdd.vue
  technology: Vue, Nuxt UI
  group: Inserimento e modifica
description: Scrive, mostra e modifica le note del giorno
---

Comprende il campo per la nota veloce in fondo alla vista giorno (invio = nota con l'ora corrente; si può partire anche da una foto), l'editor completo (testo, giorno, ora, tag, foto) e la scheda della nota con le miniature e il menu modifica/elimina. Le eliminazioni si annullano dal toast.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/components/QuickAdd.vue](../../../../../../app/components/QuickAdd.vue) | [app/utils/actions.ts](../../../../../../app/utils/actions.ts) | Salva le note | Chiamata di funzione |
| [app/components/NoteEditor.vue](../../../../../../app/components/NoteEditor.vue) | [app/components/PhotoPicker.vue](../../../../../../app/components/PhotoPicker.vue) | Allega le foto | Componente Vue |
| [app/components/QuickAdd.vue](../../../../../../app/components/QuickAdd.vue) | [app/utils/photos.ts](../../../../../../app/utils/photos.ts) | Salva la foto scattata | Chiamata di funzione |
