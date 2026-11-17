---
type: C4 Actor
title: Utente
status: stable
groma:
  id: utente
---

La persona che tiene il diario sul proprio telefono. Ogni giorno vuole vedere cosa deve fare, registrarlo velocemente, annotare pensieri e foto e, nel tempo, vedere i propri progressi e ritrovare quello che ha scritto. Usa l'app da sola, senza account.

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [utente](utente.md) | [app/pages/index.vue](../../app/pages/index.vue) | Registra la giornata | Tocco |
| [utente](utente.md) | [app/pages/calendario.vue](../../app/pages/calendario.vue) | Sfoglia i mesi | Tocco |
| [utente](utente.md) | [app/pages/andamento/index.vue](../../app/pages/andamento/index.vue) | Controlla i progressi | Tocco |
| [utente](utente.md) | [app/pages/inbox.vue](../../app/pages/inbox.vue) | Gestisce le cose da fare | Tocco, swipe |
| [utente](utente.md) | [app/pages/cerca.vue](../../app/pages/cerca.vue) | Cerca nel diario | Tocco |
| [utente](utente.md) | [app/pages/impostazioni/index.vue](../../app/pages/impostazioni/index.vue) | Configura l'app | Tocco |
| [utente](utente.md) | [app/pages/benvenuto.vue](../../app/pages/benvenuto.vue) | Configura il primo avvio | Tocco |
