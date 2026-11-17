---
type: C4 Component
title: Primo avvio
status: stable
groma:
  id: primo-avvio
  parent: web-app
  code:
    - scanner: vue
      file: app/pages/benvenuto.vue
    - scanner: typescript
      file: app/middleware/onboarding.global.ts
    - scanner: vue
      file: app/middleware/onboarding.global.ts
  technology: Vue, Nuxt route middleware
  group: Schermate
description: Onboarding e migrazione automatica dalla versione precedente
---

Un middleware globale carica le preferenze. Se l'utente non ha ancora completato il primo avvio, prova a importare in silenzio i dati della vecchia app Angular (tramite Backup); se non ci sono, porta al benvenuto. Il benvenuto ha tre passi: presentazione, scelta dei pacchetti di attività dal Catalogo, guida all'installazione. Si può anche importare subito un backup.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/middleware/onboarding.global.ts](../../../../../../app/middleware/onboarding.global.ts) | [app/composables/usePreferences.ts](../../../../../../app/composables/usePreferences.ts) | Verifica il primo avvio | Chiamata di funzione |
| [app/middleware/onboarding.global.ts](../../../../../../app/middleware/onboarding.global.ts) | [app/utils/backupIO.ts](../../../../../../app/utils/backupIO.ts) | Migra i dati v1 | Chiamata di funzione |
| [app/pages/benvenuto.vue](../../../../../../app/pages/benvenuto.vue) | [shared/utils/catalog.ts](../../../../../../shared/utils/catalog.ts) | Mostra i pacchetti | Import |
| [app/pages/benvenuto.vue](../../../../../../app/pages/benvenuto.vue) | [app/utils/actions.ts](../../../../../../app/utils/actions.ts) | Crea le attività iniziali | Chiamata di funzione |
| [app/pages/benvenuto.vue](../../../../../../app/pages/benvenuto.vue) | [app/components/InstallGuide.vue](../../../../../../app/components/InstallGuide.vue) | Mostra l'installazione | Componente Vue |
