---
type: C4 Component
title: Inbox
status: stable
groma:
  id: inbox
  parent: web-app
  code:
    - scanner: vue
      file: app/pages/inbox.vue
    - scanner: vue
      file: app/components/InboxRow.vue
    - scanner: vue
      file: app/components/InboxEditor.vue
  technology: Vue
  group: Schermate
description: Cose da fare con o senza data, che a fine lavoro diventano diario
---

Pagina con aggiunta rapida e due sezioni, "In programma" e "Senza data". Ogni riga si completa con un tap o uno swipe a destra (diventa una voce "✓ …" nel diario) e si elimina con uno swipe a sinistra. L'editor imposta dettagli, tag e data; con una data l'elemento compare anche tra i promemoria della vista giorno.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [app/pages/inbox.vue](../../../../../../app/pages/inbox.vue) | [app/utils/actions.ts](../../../../../../app/utils/actions.ts) | Aggiorna l'inbox | Chiamata di funzione |
| [app/pages/inbox.vue](../../../../../../app/pages/inbox.vue) | [app/composables/useData.ts](../../../../../../app/composables/useData.ts) | Legge l'inbox | useInbox |
