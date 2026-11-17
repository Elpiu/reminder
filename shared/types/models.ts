/** Chiave giorno locale nel formato `YYYY-MM-DD`. */
export type DateKey = string

/** Tipo di valore registrato da un'attività. */
export type ValueKind = 'check' | 'counter' | 'number' | 'duration' | 'scale' | 'choice' | 'text'

/**
 * Quando un'attività è prevista.
 * I giorni della settimana usano la numerazione ISO: 1 = lunedì … 7 = domenica.
 */
export type Recurrence =
  | { type: 'none' }
  | { type: 'daily' }
  | { type: 'weekdays', days: number[] }
  | { type: 'interval', every: number }
  | { type: 'weekly', times: number }
  | { type: 'monthly', day: number }

export interface Goal {
  /** `gte`: almeno il valore (es. 8 bicchieri); `lte`: al massimo (es. 2 caffè). */
  op: 'gte' | 'lte'
  target: number
}

export type ActivityColor =
  | 'teal' | 'emerald' | 'lime' | 'amber' | 'orange' | 'rose'
  | 'fuchsia' | 'violet' | 'indigo' | 'sky' | 'cyan' | 'stone'

export interface Activity {
  id: string
  name: string
  icon: string
  color: ActivityColor
  kind: ValueKind
  /** Unità per `number` (es. km, €, kg). */
  unit: string
  goal: Goal | null
  /** Incremento per `counter`. */
  step: number
  /** Etichette della scala (lunghezza = numero di livelli, valori 1..n). */
  scaleLabels: string[]
  /** Opzioni per `choice`. */
  choices: string[]
  recurrence: Recurrence
  /** Primo giorno da cui l'attività conta nelle statistiche e nelle ricorrenze. */
  startDate: DateKey
  /** Orario indicativo `HH:mm` mostrato nella vista giorno, opzionale. */
  time: string | null
  tagIds: string[]
  order: number
  archived: boolean
  createdAt: string
  updatedAt: string
}

/** Valore registrato: boolean (check), number (counter/number/duration in minuti/scale), string (choice/text). */
export type EntryValue = boolean | number | string | null

export interface Entry {
  id: string
  date: DateKey
  /** Orario `HH:mm`. */
  time: string
  /** `null` per le note libere del diario. */
  activityId: string | null
  value: EntryValue
  /** Testo della nota, o commento al valore di un'attività. */
  text: string
  tagIds: string[]
  photoIds: string[]
  source: 'manual' | 'inbox' | 'import'
  createdAt: string
  updatedAt: string
}

export interface InboxItem {
  id: string
  title: string
  notes: string
  /** Se impostata, l'elemento compare anche nella vista di quel giorno. */
  dueDate: DateKey | null
  tagIds: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  createdAt: string
}

export interface Photo {
  id: string
  blob: Blob
  thumb: Blob
  type: string
  width: number
  height: number
  createdAt: string
}

export type TextScale = 'sm' | 'md' | 'lg' | 'xl'

export interface Preferences {
  onboarded: boolean
  textScale: TextScale
  /** 1 = la settimana inizia di lunedì, 7 = domenica. */
  weekStart: 1 | 7
  /** Mostra sull'icona dell'app il numero di cose ancora da fare oggi. */
  badge: boolean
  /** Notifica locale all'apertura se ci sono attività dovute. */
  notifyOnOpen: boolean
  /** Comprimi la sezione "Registra anche" nella vista giorno. */
  showOptional: boolean
}

export const DEFAULT_PREFERENCES: Preferences = {
  onboarded: false,
  textScale: 'md',
  weekStart: 1,
  badge: true,
  notifyOnOpen: false,
  showOptional: true,
}

export interface BackupPhoto {
  id: string
  type: string
  width: number
  height: number
  createdAt: string
  /** data URL dell'immagine. */
  data: string
  /** data URL della miniatura. */
  thumb: string
}

export interface BackupData {
  activities: Activity[]
  entries: Entry[]
  inbox: InboxItem[]
  tags: Tag[]
  preferences: Partial<Preferences>
  photos: BackupPhoto[]
}

export interface BackupV2 {
  app: 'reminder'
  version: 2
  exportedAt: string
  data: BackupData
}
