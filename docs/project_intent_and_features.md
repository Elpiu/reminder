# Reminder - Intent e Feature

## Visione

Reminder e una PWA offline-first per dispositivi mobili pensata come calendario personale di note, cose da fare ed eventi semplici. L'app deve aiutare l'utente a ricordare informazioni quotidiane senza dipendere da account, rete o backend.

La home ruota attorno a un calendario mensile: i giorni con contenuti salvati sono riconoscibili a colpo d'occhio e un tap su un giorno mostra le note associate. Da quella vista l'utente puo aggiungere nuove note, consultare quelle esistenti e trasformare informazioni ricorrenti in note del giorno corrente.

## Target e Principi

- Mobile-first: l'esperienza primaria e su smartphone, con interazioni rapide e touch-friendly.
- Offline locale: tutti i dati sono salvati sul dispositivo tramite IndexedDB.
- Uso personale: niente account, multi-utente, backend o sincronizzazione cloud nella v1.
- Inserimento rapido: creare una nota o un todo deve richiedere pochi tap.
- Recupero semplice: l'utente deve poter ritrovare contenuti per data, testo, categoria e tag.
- UI concreta: la prima schermata deve essere l'app utilizzabile, non una landing page.

## Moduli Principali

### Home Calendario

- Mostra il mese corrente come vista principale.
- Usa un solo calendario inline basato su PrimeNG `DatePicker`.
- Evidenzia direttamente nel `DatePicker` il giorno corrente.
- Evidenzia direttamente nel `DatePicker` i giorni che contengono note salvate.
- Permette di selezionare un giorno con tap/click.
- Mostra la lista delle note del giorno selezionato.
- Permette di aggiungere una nuova nota direttamente dal giorno selezionato.

### Note Calendario

Una nota calendario rappresenta un'informazione assegnata a una data precisa.

Campi minimi:

- Titolo.
- Descrizione opzionale.
- Data.
- Categoria opzionale.
- Lista opzionale di tag.

Le note servono per ricordare cose, segnare eventi, appuntare informazioni e costruire uno storico personale consultabile dal calendario.

### Categorie e Tag

- L'utente puo creare categorie predefinite.
- L'utente puo creare tag predefiniti.
- Una nota puo avere una categoria.
- Una nota puo avere piu tag.
- Categorie e tag sono riutilizzabili nella creazione e modifica delle note.
- Categorie e tag sono criteri di ricerca e filtro.

### Template Ricorrenti

Le note ricorrenti della v1 sono template manuali, non ricorrenze automatiche.

Comportamento previsto:

- Da una nota normale e disponibile un'azione per aggiungerla ai ricorrenti.
- Il template conserva titolo, descrizione, categoria e tag.
- La sezione ricorrenti mostra i template salvati.
- Con un singolo tap/click l'utente puo copiare un template nelle note del giorno corrente.
- Il sistema non genera note automaticamente per giorni futuri.
- Il sistema non deve implementare regole giornaliere, settimanali o mensili nella v1.

### Todo Non Datati

La pagina todo raccoglie task semplici non ancora assegnati a una data.

Campi minimi:

- Titolo.
- Descrizione opzionale.
- Categoria opzionale.
- Lista opzionale di tag.

Quando un todo viene completato, l'utente sceglie tra:

- Eliminarlo definitivamente.
- Eliminarlo dalla lista todo e aggiungerlo come nota nel calendario del giorno corrente.

### Ricerca

La ricerca deve permettere di trovare note e contenuti salvati usando:

- Range data.
- Titolo.
- Descrizione.
- Categoria.
- Tag.

La ricerca deve funzionare offline sui dati locali.

## Entita Concettuali

Queste entita descrivono il dominio della v1 senza imporre ancora uno schema definitivo:

- `CalendarNote`: nota assegnata a una data del calendario.
- `TodoItem`: task semplice non assegnato a una data.
- `Category`: categoria riutilizzabile.
- `Tag`: tag riutilizzabile.
- `RecurringNoteTemplate`: template manuale copiabile nel giorno corrente.

## Success Criteria

- L'utente puo aprire l'app e vedere subito il calendario mensile.
- L'utente puo creare una nota associata a un giorno in pochi tap.
- I giorni con contenuti sono visivamente distinguibili dentro il calendario PrimeNG.
- L'utente puo gestire categorie e tag predefiniti.
- L'utente puo salvare una nota come template ricorrente e riutilizzarla rapidamente.
- L'utente puo gestire todo non datati e convertirli in note del giorno corrente.
- L'utente puo cercare contenuti per data, testo, categoria e tag.
- L'app rimane utilizzabile senza connessione a internet dopo essere stata installata/cacheata.

## Funzionalita Sviluppate

- Shell mobile-first con navigazione principale per Home, Todo, Ricorrenti, Cerca e Libreria.
- Tema PrimeNG Aura configurato in modalita dark tramite selettore `.app-dark`.
- Home con un solo calendario PrimeNG `DatePicker` inline.
- Template custom del `DatePicker` per marcare giorno corrente, giorno selezionato e conteggio note del giorno.
- Selezione giorno da calendario con aggiornamento della lista note salvate per quel giorno.
- Creazione note con titolo, descrizione, categoria e tag multipli.
- Creazione todo non datati con conversione in nota del giorno corrente o eliminazione.
- Creazione template ricorrenti da una nota esistente.
- Copia manuale di un template ricorrente nelle note del giorno corrente.
- Ricerca note per testo, range data, categoria e tag.
- Gestione locale di categorie e tag riutilizzabili.
- Persistenza offline locale tramite IndexedDB/idb-keyval.
- Manifest e service worker base per esperienza PWA offline locale.

## Fuori Scope v1

- Backend remoto.
- Account utente.
- Sincronizzazione multi-dispositivo.
- Notifiche push.
- Ricorrenze automatiche con regole calendariali.
- Condivisione note tra utenti.
