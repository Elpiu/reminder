# Reminder - Tech Stack e Regole di Progetto

Questo progetto e una PWA mobile-first e offline-first realizzata con **Angular 21**, **TypeScript**, **PrimeNG 21**, **TailwindCSS 4**, **NgRx Signals** e **idb-keyval**.

L'obiettivo e scrivere codice scalabile, mantenibile, accessibile e performante per un calendario personale di note, todo e template ricorrenti salvati localmente sul dispositivo.

## 1. Stack Confermato

- **Framework**: Angular 21.
- **Linguaggio**: TypeScript con typing stretto.
- **UI library**: PrimeNG 21 con theming engine e token.
- **Styling**: TailwindCSS 4.
- **State management**: NgRx Signals (`@ngrx/signals`, `signalStore`).
- **Persistenza locale**: idb-keyval come wrapper IndexedDB.
- **PWA**: Angular Service Worker e manifest web.
- **Test runner**: Vitest tramite builder unit-test Angular.
- **Icone**: PrimeIcons, salvo esigenze specifiche future.

## 2. Intent Tecnico della v1

La v1 deve funzionare come applicazione locale installabile/cacheabile, senza backend e senza account.

- IndexedDB e la fonte persistente dei dati.
- Lo stato runtime vive negli store NgRx Signals.
- I componenti non accedono direttamente a IndexedDB.
- Non e prevista sincronizzazione cloud.
- Non sono previste notifiche push nella v1.
- Le note ricorrenti sono template manuali copiabili nel giorno corrente, non ricorrenze automatiche.
- Export, import e reset sono operazioni locali sul database IndexedDB; non implicano backend o account.

## 3. Architettura Applicativa

- **Pages / Feature components**: componenti smart collegati a routing, store e use case dell'app.
- **UI components**: componenti presentazionali, riutilizzabili, senza conoscenza della persistenza o dello store globale.
- **Stores**: `signalStore` dedicati alla gestione di collezioni, filtri, selezioni e stato UI rilevante.
- **Persistence services**: servizi dedicati che incapsulano `idb-keyval`.
- **Models**: tipi TypeScript stretti per le entita persistite e per gli input/output dei componenti.

Struttura raccomandata:

- `src/app/<feature-name>/`: pagine e feature verticali standalone, come `calendar-view`, `todos-view`, `recurring-view`, `search-view` e `settings-view`.
- `src/app/shared/ui/`: componenti UI generici e riutilizzabili.
- `src/app/shared/data-access/`: servizi di persistenza e accesso dati condivisi.
- `src/app/shared/models/`: interfacce e tipi condivisi.
- `src/app/shared/utils/`: funzioni pure condivise, ad esempio gestione date e chiavi giorno.

La shell principale vive in `src/app/app.ts` e coordina la navigazione tra le viste tramite `activeView` nello store.

## 4. Dominio v1

Le entita concettuali da modellare sono:

- `CalendarNote`: nota assegnata a una data.
- `TodoItem`: task non ancora assegnato a una data.
- `Category`: categoria riutilizzabile.
- `Tag`: tag riutilizzabile.
- `RecurringNoteTemplate`: template manuale copiabile nelle note del giorno corrente.
- `ReminderDatabase`: snapshot persistito con note, todo, categorie, tag e template.
- `ReminderBackup`: backup JSON versionato per export/import.

Gli schemi definitivi possono evolvere durante l'implementazione, ma devono sempre rispettare questi vincoli:

- Ogni entita persistita ha un ID univoco generato client-side.
- Le date giorno persistite usano chiavi `YYYY-MM-DD` locali generate da `toDateKey`.
- I timestamp tecnici (`createdAt`, `updatedAt`, `exportedAt`) usano stringhe ISO.
- Categoria e tag devono essere riutilizzabili e ricercabili.
- Le categorie hanno nome, colore e icona PrimeIcons.
- Le note calendario conservano la sorgente (`manual`, `todo`, `template`).
- I template ricorrenti non devono creare note future in automatico.
- Il formato backup corrente e `version: 1`; versioni non supportate devono essere rifiutate in import.

## 5. Angular 21 Rules

- Usare componenti standalone. Non specificare `standalone: true` quando Angular lo considera gia default.
- Usare `ChangeDetectionStrategy.OnPush` per tutti i componenti.
- Usare `inject()` per la dependency injection, evitando constructor injection.
- Non usare `any`; usare tipi espliciti o `unknown` quando necessario.
- Usare `input()`, `input.required()`, `output()`, `model()` e `viewChild()` dove appropriato.
- Usare `computed()` per stato derivato.
- Minimizzare `effect()`; preferire computed state, metodi dello store o flussi espliciti.
- Usare sempre il nuovo control flow Angular: `@if`, `@for`, `@switch`.
- Non usare `*ngIf`, `*ngFor` o `*ngSwitch`.
- Non usare `@HostBinding` o `@HostListener`; usare la proprieta `host` nel decorator.

## 6. NgRx Signals Rules

- Definire gli store con `signalStore`.
- Usare `withState`, `withComputed`, `withMethods` e `withHooks`.
- Usare `withEntities` per collezioni CRUD quando adatto.
- Usare `patchState` per aggiornamenti immutabili.
- Caricare lo stato iniziale da IndexedDB tramite `onInit` dello store o tramite initializer dedicato.
- Gestire le operazioni asincrone in modo esplicito, con servizi Promise-based e store che espongono metodi chiari.
- Tenere separati stato persistito, filtri di ricerca e stato UI temporaneo.

## 7. Persistenza Offline con idb-keyval

- Incapsulare `idb-keyval` in servizi dedicati, ad esempio `CalendarNotesPersistenceService`, `TodosPersistenceService` o un `StorageService` condiviso.
- Non chiamare `get`, `set`, `del` o altre API `idb-keyval` direttamente dai componenti.
- Gestire le Promise con `async/await` nei servizi.
- Gli store devono orchestrare caricamento, salvataggio, aggiornamento ed eliminazione tramite i servizi.
- Lo storage deve essere locale e autosufficiente: l'app deve continuare a funzionare senza rete.
- Prevedere versionamento/migrazione dati solo quando diventa necessario; non introdurre complessita prematura nella v1.

## 8. UI, PrimeNG e Tailwind

- La home deve avere il calendario mensile come vista primaria.
- Usare un solo PrimeNG `DatePicker` inline come calendario della Home.
- Inserire evidenze di giorno corrente, giorno selezionato e conteggio note tramite template del `DatePicker`, non tramite un calendario custom duplicato.
- Usare componenti PrimeNG per controlli standard: `p-button`, `pInputText`, `pTextarea`, `p-select`, `p-multiselect`, dialog, form controls, tab/menu/navigation dove utile.
- Non usare input/select/textarea HTML nativi non decorati quando esiste un componente o direttiva PrimeNG adatta.
- Configurare e mantenere l'interfaccia principale scura con token PrimeNG e preset Aura.
- Usare Tailwind per layout, spacing, griglie, responsive design e tipografia.
- Preferire classi semantiche PrimeNG/Tailwind collegate al tema:
  - Testo: `text-color`, `text-color-secondary`, `text-primary`.
  - Background: `bg-surface-0` fino a `bg-surface-950` quando disponibili.
  - Bordi: token/classi coerenti con le superfici del tema.
- Evitare colori hardcoded come default, salvo variazioni intenzionali e motivate.
- Non costruire una landing page: la prima schermata deve essere l'esperienza utilizzabile dell'app.
- Progettare per touch: target comodi, spazio sufficiente, bottom navigation o pattern equivalenti se adatti.
- Evitare layout desktop-first difficili da usare su smartphone.

## 9. Component Reusability

- I componenti in `src/app/shared/ui/` devono essere presentazionali.
- I componenti UI ricevono dati tramite `input()` e comunicano eventi tramite `output()`.
- I componenti UI non leggono store globali e non chiamano servizi di persistenza.
- Preferire template inline per componenti piccoli sotto circa 50 righe.
- Estrarre componenti solo quando riducono duplicazione reale o rendono piu chiaro un workflow.

## 10. Ricerca e Filtri

La ricerca deve supportare:

- Range data.
- Titolo.
- Descrizione.
- Categoria.
- Tag.

Le funzioni di ricerca devono lavorare sui dati locali gia caricati o recuperati da IndexedDB. La logica di filtro deve restare testabile e separata dalla UI quando possibile.

## 11. Backup, Import e Reset

- Il backup deve essere un JSON autosufficiente con `version`, `exportedAt` e `database`.
- L'import deve normalizzare e validare ogni collezione prima di sostituire i dati locali.
- L'import sostituisce l'intero database locale, non esegue merge parziali.
- Il reset deve ricreare il database default tramite `createDefaultDatabase()`.
- Le azioni distruttive di import e reset devono richiedere conferma esplicita nell'interfaccia.
- La normalizzazione deve preservare compatibilita ragionevole con dati precedenti quando possibile, ad esempio assegnando un'icona fallback alle categorie senza icona.

## 12. Accessibilita

- Usare HTML semantico: `header`, `main`, `section`, `nav`, `footer` quando appropriato.
- Ogni controllo interattivo solo-icon deve avere `aria-label`.
- Preservare navigabilita da tastiera.
- Verificare stati focus visibili.
- Usare label associate agli input.
- Non affidare informazioni essenziali solo al colore.

## 13. Testing

- Usare Vitest per unit test e component test disponibili nel progetto quando l'utente richiede esplicitamente di farlo.
- Non eseguire test automatici unit/component senza richiesta esplicita dell'utente.
- Non eseguire test manuali o end-to-end: questa verifica resta responsabilita dell'utente.
- Progettare store, servizi di persistenza e funzioni di filtro in modo che siano testabili con casi mirati.
- Coprire almeno:
  - Creazione, modifica ed eliminazione note.
  - Conversione todo in nota del giorno corrente.
  - Creazione template ricorrente da nota.
  - Copia template ricorrente nel giorno corrente.
  - Ricerca per data, testo, categoria e tag.
  - Export, normalizzazione import e reset del database.

## 14. Regole di Qualita

- Mantenere il codice semplice e leggibile.
- Non introdurre backend, auth, sync cloud, notifiche push o ricorrenze automatiche nella v1.
- Non aggiungere astrazioni prima che servano.
- Preferire naming esplicito e coerente con il dominio.
- Documentare decisioni tecniche non ovvie direttamente nel codice o nei docs.
- Tenere aggiornati i docs quando una scelta di prodotto o architettura cambia.
