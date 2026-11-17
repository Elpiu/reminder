# Reminder – prodotto (v2)

## Visione

Un diario quotidiano generalista e configurabile. L'utente decide cosa tracciare e quando; l'app gli mostra ogni giorno cosa c'è da fare e cosa ha già registrato, e gli lascia spazio per scrivere. Facilità d'uso prima di tutto: registrare deve costare uno o due tap.

## Principi

- **Mobile first, offline first**: PWA installabile. Tutti i dati sono in IndexedDB sul dispositivo, senza account, backend o sync.
- **Pochi concetti**: attività, voci, inbox, tag. Le categorie della v1 non esistono più.
- **Nessun form lungo di default**: subito il campo principale, il resto dietro "Altro".
- **Annulla invece di conferme**: le eliminazioni mostrano un toast con *Annulla*. La conferma esplicita resta solo per import e reset.
- **Mai una schermata vuota**: il primo avvio propone pacchetti di attività pronti.
- **Accessibile**:
  - target touch ≥ 44 px;
  - focus visibile;
  - etichette ARIA sui controlli solo-icona;
  - informazione mai affidata solo al colore;
  - testo scalabile;
  - `prefers-reduced-motion` rispettato.

## Modello

### Attività
Una cosa da tracciare nel tempo, con questi campi:
- nome, icona Lucide e colore;
- tipo di valore:
  - `check`: fatto/non fatto;
  - `counter`: contatore;
  - `number`: numero, con unità;
  - `duration`: durata, in minuti;
  - `scale`: scala, livelli 1..n con etichette;
  - `choice`: scelta tra opzioni;
  - `text`: testo;
- obiettivo facoltativo, `≥` o `≤` un valore;
- ricorrenza;
- data di inizio;
- orario indicativo, che ordina le attività nella giornata;
- tag;
- ordine;
- archiviazione.

Ricorrenze:
| Tipo | Significato |
|---|---|
| `daily` | ogni giorno |
| `weekdays` | giorni della settimana scelti (ISO 1 = lunedì … 7 = domenica) |
| `weekly` | N volte a settimana: prevista ogni giorno finché l'obiettivo settimanale non è raggiunto |
| `interval` | ogni N giorni a partire dalla data di inizio |
| `monthly` | un giorno del mese; nei mesi più corti vale l'ultimo giorno |
| `none` | quando capita: compare in "Registra anche", non conta come da fare |

### Voce
Una registrazione in un giorno, con orario:
- **valore di un'attività**: una sola voce per attività e giorno, con commento facoltativo;
- **nota libera del diario**: testo, tag e foto.

### Inbox
Cose da fare, con o senza data:
- con una data compaiono tra i "Promemoria" di quel giorno; quelle in ritardo compaiono oggi;
- completate diventano una voce del diario.

### Tag
Unico strumento di classificazione:
- si creano al volo;
- eliminare un tag lo toglie da voci, inbox e attività.

### Foto
Ogni foto viene ridimensionata (lato lungo max 1600 px, WebP/JPEG) e salvata come Blob in IndexedDB, insieme a una miniatura da 360 px.

## Schermate

| Schermata | Contenuto |
|---|---|
| **Oggi / Giorno** (`/`, `/?d=YYYY-MM-DD`) | <ul><li>striscia della settimana (swipe per cambiarla) con l'anello di completamento di ogni giorno</li><li>"Da fare" con barra di avanzamento</li><li>"Promemoria" dall'inbox</li><li>"Registra anche"</li><li>"Diario"</li><li>campo per la nota veloce, con fotocamera</li></ul> |
| **Calendario** | Mese con l'anello di completamento di ogni giorno e i segni per note e foto, più il riepilogo del mese |
| **Andamento** | Completamento, serie e note del periodo; per ogni attività percentuale, serie e mappa di 17 settimane |
| **Dettaglio attività** | <ul><li>serie attuale e record</li><li>percentuale di completamento</li><li>mappa annuale</li><li>grafico dei valori</li><li>distribuzione delle scelte</li><li>registrazioni recenti</li></ul> |
| **Inbox** | Aggiunta rapida; gli elementi sono divisi in "In programma" e "Senza data"; swipe a destra per completare, a sinistra per eliminare |
| **Cerca** | Testo (senza accenti né maiuscole), attività o solo note, tag, periodo; risultati raggruppati per giorno |
| **Impostazioni** | <ul><li>attività (crea, modifica, ordina, archivia, pacchetti)</li><li>tag</li><li>aspetto</li><li>promemoria</li><li>installazione</li><li>backup</li></ul> |
| **Benvenuto** | Presentazione, scelta dei pacchetti, guida all'installazione, import di un backup |

## Promemoria e limiti

- **Badge**: numero di attività previste e non completate, più i promemoria dell'inbox. Funziona su Android e su iOS ≥ 16.4 con l'app installata.
- **Notifica all'apertura**: facoltativa.
- **Niente notifiche programmate**: senza un server non sono affidabili ad app chiusa.
- **iOS**: l'installazione si fa da Safari, con *Condividi → Aggiungi alla schermata Home*. La guida in app lo spiega.

## Backup

- **Formato `version: 2`**:
  - attività, voci, inbox, tag e preferenze;
  - foto facoltative, come data URL.
- **Import**:
  - sostituisce tutti i dati, dopo conferma;
  - accetta anche il backup `version: 1` della vecchia app e lo converte.
- **Migrazione automatica**: al primo avvio, se nello stesso browser c'è il vecchio database (`reminder` / `app-state`), viene convertito una volta sola.

## Fuori scope

- Sync tra dispositivi e account.
- Notifiche push programmate.
- Condivisione.
