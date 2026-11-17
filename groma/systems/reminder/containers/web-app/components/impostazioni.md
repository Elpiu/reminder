---
type: C4 Component
title: Impostazioni
status: stable
groma:
  id: impostazioni
  parent: web-app
  code:
    - scanner: vue
      file: app/pages/impostazioni/index.vue
  technology: Vue
  group: Schermate
description: Preferenze, promemoria, installazione e dati
---

Porta alla gestione di attività e tag e imposta tema, dimensione del testo e inizio della settimana. Accende il badge e la notifica all'apertura, chiedendo il permesso al sistema, e spiega perché non ci sono notifiche a orario. Gestisce export, import e reset dei dati tramite Backup.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/pages/impostazioni/index.vue](../../../../../../app/pages/impostazioni/index.vue) | [app/composables/usePreferences.ts](../../../../../../app/composables/usePreferences.ts) | Salva le preferenze | Chiamata di funzione |
| [app/pages/impostazioni/index.vue](../../../../../../app/pages/impostazioni/index.vue) | [app/utils/backupIO.ts](../../../../../../app/utils/backupIO.ts) | Esporta e importa | Chiamata di funzione |
| [app/pages/impostazioni/index.vue](../../../../../../app/pages/impostazioni/index.vue) | [app/components/ConfirmModal.vue](../../../../../../app/components/ConfirmModal.vue) | Chiede conferma | useOverlay |
| [app/pages/impostazioni/index.vue](../../../../../../app/pages/impostazioni/index.vue) | [app/components/InstallGuide.vue](../../../../../../app/components/InstallGuide.vue) | Mostra l'installazione | Componente Vue |
