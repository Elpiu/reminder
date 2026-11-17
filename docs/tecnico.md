# Reminder – stack e regole tecniche

## Stack

- **Nuxt 4** (SPA, `ssr: false`), Vue 3.5 `<script setup lang="ts">`, TypeScript 5.9 strict, **pnpm**.
- **Nuxt UI v4**:
  - l'app è avvolta in `<UApp :locale="it">`;
  - per le notifiche `useToast()`, per sheet e dialog `useOverlay()` (UDrawer, UModal).
- **Tailwind CSS v4**:
  - configurato solo da CSS ([app/assets/css/main.css](../app/assets/css/main.css)), nessun `tailwind.config`;
  - colori `primary: teal` e `neutral: stone`, in [app/app.config.ts](../app/app.config.ts);
  - `--ui-primary` usa la tonalità 700 nel tema chiaro e la 400 nel tema scuro;
  - `--ui-bg` vale `#fafaf9` nel tema chiaro e `#151311` nel tema scuro.
- **Font locali** `@fontsource-variable/inter` (sans) e `literata` (serif, per titoli e testo del diario); `ui.fonts: false`.
- **Icone Lucide** incluse nel bundle (`icon.provider: 'none'`, `fallbackToApi: false`). Le icone scelte a runtime (`ACTIVITY_ICONS`) sono elencate in `clientBundle.icons`.
- **@nuxtjs/i18n**: italiano (predefinito) e inglese, file in `i18n/locales/`, strategia `no_prefix` (stesse URL per tutte le lingue). Al primo avvio segue la lingua del browser; la scelta è salvata nel cookie `reminder_lang`.
- **Dexie** (IndexedDB), con database `reminder-v2`.
- **@vite-pwa/nuxt**: aggiornamento automatico, precache di HTML, JS, CSS, font e icone, fallback di navigazione, prompt di installazione.
- **Qualità**: `@nuxt/eslint`, `nuxt typecheck` (vue-tsc), Vitest.

## Struttura

```
shared/                 logica pura, importabile da app e test
  types/models.ts       entità e tipi persistiti
  utils/dates.ts        chiavi giorno YYYY-MM-DD locali, griglie, durate
  utils/recurrence.ts   ricorrenze, completamento, piano del giorno, statistiche e serie
  utils/backup.ts       validazione backup v2 e conversione v1
  utils/catalog.ts      icone, colori, tipi di valore, pacchetti iniziali
  utils/format.ts       formattazione di valori e date (lingua come parametro)
  utils/errors.ts       AppError: errori con codice traducibile
app/
  utils/db.ts           schema Dexie
  utils/actions.ts      tutte le scritture (con "Annulla" dove serve)
  utils/photos.ts       compressione e URL delle foto
  utils/backupIO.ts     export/import/reset e migrazione automatica dalla v1
  composables/          useLiveQuery, useData (query reattive), usePreferences, useBadgeSync,
                        useFmt (testi e formati nella lingua corrente), usePresets (pacchetti tradotti)
i18n/locales/           it.json, en.json
  components/           UI (righe attività, sheet, editor, grafici)
  pages/                Oggi, calendario, andamento, inbox, cerca, impostazioni, benvenuto
  middleware/           onboarding e migrazione al primo avvio
tests/                  Vitest sulla logica in shared/
```

## Regole

- **Componenti**: non scrivono direttamente su Dexie; usano le funzioni di `app/utils/actions.ts`.
- **Letture**: passano da `useLiveQuery`, così la UI si aggiorna da sola quando cambiano i dati.
- **Logica**: la logica di dominio (ricorrenze, statistiche, backup) resta in `shared/`, pura e coperta da test.
- **Testi**: nessun testo visibile scritto nel codice. Nei template si usa `$t('chiave')`; negli script `useFmt()` (che espone anche `t`) per date, valori, ricorrenze, tipi e colori. `shared/` non contiene testi: restituisce codici (es. `streakUnit: 'days'`, `AppError('backup.invalidFile')`) che l'app traduce. Ogni chiave va aggiunta sia in `it.json` sia in `en.json`.
- **Pacchetti iniziali**: in `PRESET_PACKS` ogni attività ha una `key`; nome, unità e scelte arrivano da `presets.activities.<key>` al momento della creazione, quindi vengono salvati nella lingua dell'utente.
- **Date**: sono chiavi locali `YYYY-MM-DD`. I timestamp tecnici sono ISO.
- **Concorrenza**: letture e scritture concorrenti (es. tap rapidi sul contatore) stanno nella stessa transazione Dexie.
- **Copie di dati**: si fanno con `plain()` (copia JSON). `structuredClone` fallisce sugli oggetti reattivi di Vue.
- **Colori delle attività**: sono una chiave della palette (`teal`, `teal-dark`, …) o un `#rrggbb` personalizzato; si risolvono con `activityColor()` e si passano come variabile CSS `--act`, con le classi `act-soft` e `act-text`. Mai colori fissi nel template.
- **Icone delle attività**: si scelgono da `ICON_CATEGORIES` in `shared/utils/catalog.ts`; tutte finiscono in `icon.clientBundle.icons`, quindi un'icona nuova va aggiunta lì (e serve riavviare `pnpm dev`).
- **Stile**:
  - colori semantici di Nuxt UI (`bg-default`, `bg-elevated`, `text-muted`, `text-highlighted`, `border-default`);
  - card `rounded-xl border border-default bg-elevated/40 p-3`;
  - pulsanti secondari `color="neutral" variant="ghost"`.
- **Accessibilità**:
  - `aria-label` su ogni controllo solo-icona;
  - `aria-pressed` sui toggle;
  - focus visibile con `focus-visible:outline-primary`.
- **Dimensione del testo**: si regola con `--app-scale` sul `font-size` di `html`; tutto è in rem.

## Deploy

- **Automatico**: [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) parte a ogni push su `master` (o a mano da Actions). Installa con pnpm, esegue test e lint, genera la build con `NUXT_APP_BASE_URL=/reminder/` e la pubblica sul branch `gh-pages` con `peaceiris/actions-gh-pages`. GitHub Pages deve servire il branch `gh-pages`, come già avveniva per la v1.
- **Manuale**: `pnpm build-and-publish` fa la stessa build e la pubblica con `gh-pages`.
- `public/.nojekyll` evita che Jekyll ignori la cartella `_nuxt`.
- `public/ngsw-worker.js` sostituisce il service worker della vecchia app Angular: chi l'aveva installata riceve questo file all'aggiornamento, che cancella le cache Angular, si disinstalla e ricarica la pagina sulla nuova app. È escluso dalla precache.
- Da Git Bash su Windows, nelle build manuali con base path serve `MSYS_NO_PATHCONV=1`.
