---
type: Groma Flow
title: Scrivere una nota con foto
groma:
  id: scrivere-una-nota-con-foto
---

Dal campo in fondo alla vista giorno l'utente scatta o sceglie una foto: viene compressa e salvata subito, poi l'editor del diario salva la nota che la contiene.

## Steps

| From | To | Action |
| --- | --- | --- |
| [Utente](../actors/utente.md) | [Vista giorno](../systems/reminder/containers/web-app/components/vista-giorno.md) | Apre la giornata |
| [Vista giorno](../systems/reminder/containers/web-app/components/vista-giorno.md) | [Diario](../systems/reminder/containers/web-app/components/diario.md) | Mostra il campo nota veloce |
| [Diario](../systems/reminder/containers/web-app/components/diario.md) | [Foto](../systems/reminder/containers/web-app/components/foto.md) | Allega la foto |
| [Foto](../systems/reminder/containers/web-app/components/foto.md) | [Sistema del dispositivo](../externals/sistema-del-dispositivo.md) | Apre fotocamera o galleria |
| [Foto](../systems/reminder/containers/web-app/components/foto.md) | [Schema del database](../systems/reminder/containers/web-app/components/schema-database.md) | Salva immagine e miniatura |
| [Diario](../systems/reminder/containers/web-app/components/diario.md) | [Azioni](../systems/reminder/containers/web-app/components/azioni.md) | Salva la nota |
| [Azioni](../systems/reminder/containers/web-app/components/azioni.md) | [Schema del database](../systems/reminder/containers/web-app/components/schema-database.md) | Scrive la voce |
