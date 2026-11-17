# Rinnovamento – proposta v2

> Stato: **approvata e implementata** (17/11/2026, branch `refactoring`). Il lavoro è tracciato in Backlog.md (task-1 e sottotask). Documentazione aggiornata in docs/prodotto.md e docs/tecnico.md.

## 1. Cosa cambia in una frase

Da "calendario con note, todo e template" a **un diario quotidiano configurabile**: l'utente decide *cosa* tracciare (abitudini, attività, misure, note libere) e *quando* ricorre, e ogni giorno l'app gli mostra cosa c'è da fare e cosa ha già registrato.

## 2. Cosa non funziona oggi (dal punto di vista d'uso)

| Problema | Effetto |
|---|---|
| Quattro concetti simili (nota, todo, template, categoria + tag) | L'utente deve capire dove mettere una cosa prima di scriverla |
| I ricorrenti sono template da copiare a mano | Non c'è un "cosa devo fare oggi": bisogna ricordarsi di andare in Ricorrenti |
| Il form di inserimento è sempre aperto e lungo (titolo, descrizione, categoria, tag) | Registrare "ho bevuto un bicchiere d'acqua" costa 4 campi |
| Le note hanno solo testo | Non si possono registrare valori (km, ore di sonno, umore, €) né vederne l'andamento |
| Layout desktop a due colonne, navigazione a pillole in alto | Su telefono si scorre molto e i comandi sono lontani dal pollice |

## 3. Il nuovo modello (meno concetti, più potenti)

### Attività (il cuore configurabile)
Una cosa che l'utente vuole tracciare nel tempo. Si crea una volta, si registra in un tap.

- **Nome, icona (Lucide), colore**
- **Tipo di valore**
  - ✅ *Sì/No* – "Preso il farmaco", "Meditato"
  - ➕ *Contatore* – "Bicchieri d'acqua" (con obiettivo, es. 8)
  - 🔢 *Numero con unità* – "Corsa: 5,2 km", "Spesa: 12 €", "Peso: 72 kg"
  - ⏱️ *Durata* – "Lettura: 30 min", "Sonno: 7h 15m"
  - 🎚️ *Scala* – "Umore 1–5", "Energia" (con emoji o etichette)
  - 🔘 *Scelta* – "Allenamento: corsa / palestra / bici"
  - 📝 *Testo* – "Cosa ho imparato oggi"
- **Ricorrenza** (vere ricorrenze, non più copia manuale)
  - ogni giorno · giorni della settimana (es. lun/mer/ven) · ogni N giorni · N volte a settimana · giorno del mese · nessuna (registro libero)
- **Obiettivo** opzionale (es. ≥ 8, ≤ 2000 kcal, 3 volte a settimana)
- **Promemoria** opzionale (orario – vedi limiti in §7)
- Archiviabile (sparisce da "Oggi" ma i dati restano)

### Voce
Una registrazione in un giorno: o il valore di un'attività, o una **nota libera** (testo markdown leggero). Le note libere sostituiscono le "note calendario" di oggi.

### Inbox (ex Todo)
Cose da fare senza data. Quando le completi diventano voce del giorno (come ora, ma con uno swipe). Si può assegnare una data → si spostano nel giorno.

### Tag
Restano come unico modo di classificare. **Le categorie scompaiono**: colore e icona passano alle attività, il resto lo fanno i tag. Un concetto in meno.

## 4. Navigazione (mobile first, bottom bar + pulsante +)

```
┌─────────────────────────────┐
│  Martedì 17 nov        ⚙️ 🔍│  header sticky, blur
│ ‹ L  M [M] G  V  S  D ›     │  striscia settimana, swipe = cambia giorno
├─────────────────────────────┤
│ DA FARE OGGI         3 / 6  │  progress
│ 💊 Farmaco            [ ✓ ] │  tap = fatto
│ 💧 Acqua   ●●●●●○○○  [ + ]  │  tap = +1, long press = valore
│ 🏃 Corsa              [5 km]│  tap = sheet numerico
│ 😊 Umore    😞 😐 🙂 😄 🤩  │  scelta diretta in riga
├─────────────────────────────┤
│ DIARIO                      │
│ 09:12  Riunione spostata…   │
│ 18:40  Idea per il weekend  │
├─────────────────────────────┤
│ [ Scrivi qualcosa…      ➤ ] │  quick add sempre visibile
├─────────────────────────────┤
│  Oggi  Calendario  Andamento  Inbox │  bottom nav
└─────────────────────────────┘
```

1. **Oggi** – la schermata principale (è anche "qualsiasi giorno": dal calendario si apre la stessa vista). Le attività dovute quel giorno, completabili in un tap; sotto il diario della giornata; in fondo un campo di inserimento rapido.
2. **Calendario** – mese con indicatori per giorno (anello di completamento + puntino se ci sono note). Tap → apre il giorno.
3. **Andamento** – per ogni attività: serie (streak), % di completamento, mappa annuale stile heatmap, grafico dei valori numerici. Filtri per periodo.
4. **Inbox** – le cose senza data, con swipe "fatto" / "sposta a oggi".
5. **Impostazioni** (icona in header) – Attività, Tag, Aspetto (chiaro/scuro/sistema, dimensione testo), Backup (export/import/reset), Info PWA.
6. **Cerca** (icona in header) – testo, periodo, attività, tag; risultati raggruppati per giorno.

## 5. Facilità d'uso – principi concreti

- **Registrare = 1 tap** per Sì/No e contatori, **2 tap** per tutto il resto (sheet dal basso con tastierino numerico/scelte grandi).
- **Primo avvio guidato**: scelta di un *pacchetto iniziale* (Benessere, Casa, Studio/Lavoro, Vuoto) che crea attività già pronte e modificabili. Niente schermata vuota.
- **Nessun form lungo visibile di default**: titolo/testo subito, il resto (tag, data, ora) dietro "Altro".
- **Annulla al posto di "Sei sicuro?"**: le eliminazioni mostrano un toast con *Annulla* (conferma esplicita solo per reset e import).
- **Gesti**: swipe orizzontale sulla striscia giorni, swipe sulle righe dell'Inbox, long press per modificare.
- **Accessibile**: target ≥ 44 px, focus visibile, nessuna informazione affidata solo al colore, testo scalabile (`--card-scale`), `prefers-reduced-motion`.
- **Offline davvero**: nessuna richiesta di rete (font e icone in bundle).

## 6. Stack (da progetto Bookpack)

- **Nuxt 4** SPA (`ssr: false`), Vue 3.5 `<script setup lang="ts">`, TypeScript 5.9, **pnpm**
- **Nuxt UI v4** + **Tailwind CSS v4** (config solo da CSS), `primary: teal`, `neutral: stone`, override `--ui-bg` / `--ui-primary` chiaro/scuro
- Font locali: Inter Variable (sans) + Literata Variable (serif, per titoli e testo del diario)
- Icone **Lucide** in bundle (`provider: 'none'`, `fallbackToApi: false`)
- **Dexie** (IndexedDB) per i dati, con `liveQuery` per aggiornare la UI
- **@vite-pwa/nuxt** (autoUpdate, prompt di installazione, offline), `theme-color #0f766e`
- Qualità: `@nuxt/eslint`, `vue-tsc`, **Vitest** (logica di ricorrenza e statistiche testate)
- Deploy: `nuxt generate` → GitHub Pages su `/reminder/` (come oggi)

## 7. Limiti onesti da sapere

- **Promemoria/notifiche**: una PWA senza server non può programmare notifiche affidabili ad app chiusa (l'API "Notification Triggers" non esiste più). Possiamo fare:
  - badge sull'icona dell'app installata con il numero di attività ancora da fare oggi (`navigator.setAppBadge`, supportato su Android e iOS ≥ 16.4 installata);
  - notifica locale quando l'app viene aperta o torna in primo piano;
  - in futuro: export `.ics` delle attività ricorrenti da importare nel calendario del telefono (che invece le notifica).
- **iOS**: l'installazione si fa da Safari → Condividi → "Aggiungi a Home"; il prompt automatico c'è solo su Android/desktop. Mostreremo una guida.
- **Dati solo locali**: il backup JSON resta il modo per spostare i dati. (Sync opzionale = fuori scope v2.)

## 8. Migrazione dai dati attuali

L'import accetta anche il backup **v1** dell'app attuale e lo converte:
- note calendario → voci "nota libera" nello stesso giorno
- template ricorrenti → attività Sì/No senza ricorrenza (l'utente poi la imposta)
- todo → Inbox
- categorie → tag (stesso nome)

## 9. Piano di lavoro (diventerà task in Backlog.md)

1. **Scaffold** Nuxt 4 + Nuxt UI + Tailwind + font/icone locali + PWA, rimozione Angular, deploy GitHub Pages
2. **Dati**: schema Dexie (attività, voci, inbox, tag, impostazioni), repository, export/import v2 + migrazione v1
3. **Motore ricorrenze** (puro, testato): "cosa è dovuto il giorno X", obiettivi, streak
4. **Shell**: layout mobile, bottom nav, header, tema, dimensione testo
5. **Oggi / Giorno**: striscia settimana, righe attività per ogni tipo di valore, diario, quick add
6. **Gestione attività**: editor (tipo, ricorrenza, obiettivo, icona, colore), archivio, riordino
7. **Calendario** mensile con indicatori
8. **Inbox** con swipe e conversione in voce
9. **Andamento**: streak, %, heatmap annuale, grafico valori
10. **Cerca**
11. **Onboarding** con pacchetti iniziali + guida installazione
12. **Impostazioni & backup** (export/import/reset, aspetto)
13. **Badge e notifiche locali**
14. **Docs**: README, screenshot, aggiornamento docs/, scan groma dell'architettura nuova

## 10. Decisioni (17/11/2026)

1. Angular viene **sostituito** da Nuxt nello stesso repo, sul branch `refactoring` che poi confluisce in `master`.
2. Le **categorie sono eliminate**, restano solo i tag.
3. Il diario usa **più voci con orario** per giorno: è il modello più flessibile, e chi preferisce "una pagina al giorno" può semplicemente scrivere una sola voce lunga.
4. Le voci supportano **foto**: ridimensionate e compresse sul dispositivo (lato lungo max 1600 px, WebP/JPEG ~0,8) e salvate come Blob in IndexedDB; il backup può includerle o escluderle.
5. Gestore pacchetti: **pnpm**.
