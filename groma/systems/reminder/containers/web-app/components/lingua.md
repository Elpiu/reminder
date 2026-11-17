---
type: C4 Component
title: Lingua e formati
status: stable
groma:
  id: lingua
  parent: web-app
  code:
    - scanner: typescript
      file: app/composables/useFmt.ts
      symbol: useFmt
    - scanner: vue
      file: app/composables/useFmt.ts
    - scanner: typescript
      file: app/composables/usePresets.ts
      symbol: usePresets
    - scanner: vue
      file: app/composables/usePresets.ts
    - scanner: vue
      file: app/components/LanguagePicker.vue
  technology: '@nuxtjs/i18n, vue-i18n, Intl'
  group: Interfaccia condivisa
description: Sceglie la lingua e traduce testi, date e valori
---

L'interfaccia è in italiano e inglese: i testi stanno in `i18n/locales/it.json` ed `en.json`, la lingua iniziale segue il browser e la scelta, fatta con il selettore nelle impostazioni o nel benvenuto, è salvata in un cookie. `useFmt` mette a disposizione delle schermate la traduzione e le formattazioni nella lingua corrente: titoli dei giorni, date, valori, ricorrenze, tipi di valore, colori, unità delle serie e messaggi degli errori `AppError`. `usePresets` traduce i pacchetti del Catalogo, così le attività create dal benvenuto nascono nella lingua dell'utente.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/composables/useFmt.ts](../../../../../../app/composables/useFmt.ts) | [shared/utils/format.ts](../../../../../../shared/utils/format.ts) | Formatta date e valori | Chiamata di funzione |
| [app/composables/useFmt.ts](../../../../../../app/composables/useFmt.ts) | [shared/utils/errors.ts](../../../../../../shared/utils/errors.ts) | Traduce gli errori | instanceof AppError |
| [app/composables/usePresets.ts](../../../../../../app/composables/usePresets.ts) | [shared/utils/catalog.ts](../../../../../../shared/utils/catalog.ts) | Traduce i pacchetti | Import |
