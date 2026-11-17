---
type: C4 Component
title: Dialogo di conferma
status: stable
groma:
  id: dialogo-conferma
  parent: web-app
  code:
    - scanner: vue
      file: app/components/ConfirmModal.vue
  technology: Nuxt UI Modal
  group: Interfaccia condivisa
description: Conferma esplicita per le azioni che non si possono annullare
---

Aperto con `useOverlay`, restituisce sì o no. Serve solo dove il toast "Annulla" non basta: importare un backup, cancellare tutti i dati, eliminare un tag in uso.
