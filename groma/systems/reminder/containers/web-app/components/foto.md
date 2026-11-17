---
type: C4 Component
title: Foto
status: stable
groma:
  id: foto
  parent: web-app
  code:
    - scanner: typescript
      file: app/utils/photos.ts
    - scanner: vue
      file: app/utils/photos.ts
    - scanner: vue
      file: app/components/PhotoPicker.vue
    - scanner: vue
      file: app/components/PhotoThumb.vue
    - scanner: vue
      file: app/components/PhotoViewer.vue
  technology: Canvas, WebP/JPEG, Dexie
  group: Inserimento e modifica
description: Acquisisce, comprime, salva e mostra le foto delle note
---

Le immagini scelte dalla fotocamera o dalla galleria vengono ridimensionate sul dispositivo (lato lungo 1600 px, più una miniatura da 360 px), salvate come Blob nel database locale e mostrate tramite URL oggetto messi in cache. Include il selettore delle foto per l'editor e il visualizzatore a schermo intero.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/components/PhotoPicker.vue](../../../../../../app/components/PhotoPicker.vue) | [sistema-del-dispositivo](../../../../../externals/sistema-del-dispositivo.md) | Apre fotocamera o galleria | input file |
| [app/utils/photos.ts](../../../../../../app/utils/photos.ts) | [app/utils/db.ts](../../../../../../app/utils/db.ts) | Salva le immagini | Dexie |
