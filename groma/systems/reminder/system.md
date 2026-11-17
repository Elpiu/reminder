---
type: C4 System
title: Reminder
status: stable
groma:
  id: reminder
description: Diario quotidiano configurabile, installabile come PWA
---

Un'unica applicazione web statica: la Web app contiene interfaccia, logica di dominio e accesso ai dati. I dati vivono nell'IndexedDB del browser e le funzioni del telefono (badge, notifiche, fotocamera, installazione) si usano tramite le API del browser. Il codice è pubblicato su GitHub Pages, ma a runtime non serve alcun servizio remoto.
