import type {
  Activity, ActivityColor, BackupData, BackupPhoto, BackupV2, Entry, EntryValue, Goal, InboxItem,
  Preferences, Recurrence, Tag, ValueKind,
} from '../types/models'
import { isDateKey, nowTime, toDateKey } from './dates'
import { isActivityColor } from './catalog'

export const BACKUP_VERSION = 2

type Rec = Record<string, unknown>

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)
const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
const arr = (v: unknown, name: string): unknown[] => {
  if (v === undefined) return []
  if (!Array.isArray(v)) throw new Error(`Il backup contiene un elenco "${name}" non valido.`)
  return v
}
const iso = (v: unknown) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : new Date().toISOString())
const time = (v: unknown, fallbackIso?: string) =>
  typeof v === 'string' && /^\d{2}:\d{2}$/.test(v) ? v : nowTime(fallbackIso ? new Date(fallbackIso) : new Date())
const reqId = (r: Rec, what: string) => {
  if (typeof r.id !== 'string' || !r.id) throw new Error(`Un elemento "${what}" nel backup non ha un id valido.`)
  return r.id
}

const KINDS: ValueKind[] = ['check', 'counter', 'number', 'duration', 'scale', 'choice', 'text']
const COLORS: ActivityColor[] = ['teal', 'emerald', 'lime', 'amber', 'orange', 'rose', 'fuchsia', 'violet', 'indigo', 'sky', 'cyan', 'stone']

export function createBackup(data: BackupData): BackupV2 {
  return { app: 'reminder', version: 2, exportedAt: new Date().toISOString(), data }
}

/** Valida un backup v2 o converte un backup v1 (app Angular). Lancia un errore leggibile se non valido. */
export function parseBackup(input: unknown): BackupData {
  if (!isRec(input)) throw new Error('Il file non contiene un backup valido.')
  if (input.version === 1) return convertV1(input.database)
  if (input.version !== BACKUP_VERSION) throw new Error('Versione del backup non supportata.')
  const data = input.data
  if (!isRec(data)) throw new Error('Il backup non contiene dati validi.')
  return {
    activities: arr(data.activities, 'attività').map(normalizeActivity),
    entries: arr(data.entries, 'voci').map(normalizeEntry),
    inbox: arr(data.inbox, 'inbox').map(normalizeInbox),
    tags: arr(data.tags, 'tag').map(normalizeTag),
    preferences: isRec(data.preferences) ? normalizePreferences(data.preferences) : {},
    photos: arr(data.photos, 'foto').map(normalizePhoto),
  }
}

function normalizeRecurrence(v: unknown): Recurrence {
  if (!isRec(v)) return { type: 'none' }
  switch (v.type) {
    case 'daily': return { type: 'daily' }
    case 'weekdays': {
      const days = Array.isArray(v.days) ? v.days.filter((d): d is number => typeof d === 'number' && d >= 1 && d <= 7) : []
      return days.length ? { type: 'weekdays', days } : { type: 'daily' }
    }
    case 'interval': return { type: 'interval', every: Math.max(1, Math.round(num(v.every, 1))) }
    case 'weekly': return { type: 'weekly', times: Math.min(7, Math.max(1, Math.round(num(v.times, 1)))) }
    case 'monthly': return { type: 'monthly', day: Math.min(31, Math.max(1, Math.round(num(v.day, 1)))) }
    default: return { type: 'none' }
  }
}

function normalizeGoal(v: unknown): Goal | null {
  if (!isRec(v) || (v.op !== 'gte' && v.op !== 'lte') || typeof v.target !== 'number') return null
  return { op: v.op, target: v.target }
}

export function normalizeActivity(input: unknown): Activity {
  if (!isRec(input)) throw new Error('Un\'attività nel backup non è valida.')
  const createdAt = iso(input.createdAt)
  const kind = KINDS.includes(input.kind as ValueKind) ? (input.kind as ValueKind) : 'check'
  return {
    id: reqId(input, 'attività'),
    name: str(input.name, 'Attività'),
    icon: str(input.icon, 'i-lucide-circle-check'),
    color: isActivityColor(input.color) ? input.color : 'teal',
    kind,
    unit: str(input.unit),
    goal: normalizeGoal(input.goal),
    step: Math.max(1, num(input.step, 1)),
    scaleLabels: strArr(input.scaleLabels),
    choices: strArr(input.choices),
    recurrence: normalizeRecurrence(input.recurrence),
    startDate: isDateKey(input.startDate) ? input.startDate : toDateKey(new Date(createdAt)),
    time: typeof input.time === 'string' && /^\d{2}:\d{2}$/.test(input.time) ? input.time : null,
    tagIds: strArr(input.tagIds),
    order: num(input.order, 0),
    archived: input.archived === true,
    createdAt,
    updatedAt: iso(input.updatedAt ?? createdAt),
  }
}

function normalizeValue(v: unknown): EntryValue {
  if (typeof v === 'boolean' || typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v))) return v
  return null
}

export function normalizeEntry(input: unknown): Entry {
  if (!isRec(input)) throw new Error('Una voce nel backup non è valida.')
  if (!isDateKey(input.date)) throw new Error('Una voce nel backup ha una data non valida.')
  const createdAt = iso(input.createdAt)
  const source = input.source === 'inbox' || input.source === 'import' ? input.source : 'manual'
  return {
    id: reqId(input, 'voce'),
    date: input.date,
    time: time(input.time, createdAt),
    activityId: typeof input.activityId === 'string' ? input.activityId : null,
    value: normalizeValue(input.value),
    text: str(input.text),
    tagIds: strArr(input.tagIds),
    photoIds: strArr(input.photoIds),
    source,
    createdAt,
    updatedAt: iso(input.updatedAt ?? createdAt),
  }
}

export function normalizeInbox(input: unknown): InboxItem {
  if (!isRec(input)) throw new Error('Un elemento dell\'inbox nel backup non è valido.')
  const createdAt = iso(input.createdAt)
  return {
    id: reqId(input, 'inbox'),
    title: str(input.title, 'Senza titolo'),
    notes: str(input.notes),
    dueDate: isDateKey(input.dueDate) ? input.dueDate : null,
    tagIds: strArr(input.tagIds),
    order: num(input.order, 0),
    createdAt,
    updatedAt: iso(input.updatedAt ?? createdAt),
  }
}

export function normalizeTag(input: unknown): Tag {
  if (!isRec(input)) throw new Error('Un tag nel backup non è valido.')
  return { id: reqId(input, 'tag'), name: str(input.name, 'tag').trim() || 'tag', createdAt: iso(input.createdAt) }
}

function normalizePreferences(p: Rec): Partial<Preferences> {
  const out: Partial<Preferences> = {}
  if (typeof p.onboarded === 'boolean') out.onboarded = p.onboarded
  if (p.textScale === 'sm' || p.textScale === 'md' || p.textScale === 'lg' || p.textScale === 'xl') out.textScale = p.textScale
  if (p.weekStart === 1 || p.weekStart === 7) out.weekStart = p.weekStart
  if (typeof p.badge === 'boolean') out.badge = p.badge
  if (typeof p.notifyOnOpen === 'boolean') out.notifyOnOpen = p.notifyOnOpen
  if (typeof p.showOptional === 'boolean') out.showOptional = p.showOptional
  return out
}

function normalizePhoto(input: unknown): BackupPhoto {
  if (!isRec(input)) throw new Error('Una foto nel backup non è valida.')
  const data = str(input.data)
  if (!data.startsWith('data:image/')) throw new Error('Una foto nel backup non è un\'immagine valida.')
  const thumb = str(input.thumb)
  return {
    id: reqId(input, 'foto'),
    type: str(input.type, 'image/jpeg'),
    width: num(input.width, 0),
    height: num(input.height, 0),
    createdAt: iso(input.createdAt),
    data,
    thumb: thumb.startsWith('data:image/') ? thumb : data,
  }
}

/**
 * Converte il database dell'app v1 (Angular):
 * note → voci del diario, template → attività "Fatto/Non fatto" senza ricorrenza, todo → inbox, categorie → tag.
 */
export function convertV1(database: unknown): BackupData {
  if (!isRec(database)) throw new Error('Il backup v1 non contiene dati validi.')
  const now = new Date().toISOString()
  const tags: Tag[] = []
  const tagByName = new Map<string, string>()
  const remap = new Map<string, string>()

  const addTag = (oldId: string, name: string, createdAt: unknown) => {
    const clean = name.trim()
    if (!clean) return
    const key = clean.toLowerCase()
    let id = tagByName.get(key)
    if (!id) {
      id = oldId
      tags.push({ id, name: clean, createdAt: iso(createdAt) })
      tagByName.set(key, id)
    }
    remap.set(oldId, id)
  }

  for (const t of arr(database.tags, 'tag')) if (isRec(t) && typeof t.id === 'string') addTag(t.id, str(t.name), t.createdAt)
  for (const c of arr(database.categories, 'categorie')) if (isRec(c) && typeof c.id === 'string') addTag(c.id, str(c.name), c.createdAt)

  const tagsOf = (r: Rec) => {
    const ids = [...strArr(r.tagIds), ...(typeof r.categoryId === 'string' ? [r.categoryId] : [])]
    return [...new Set(ids.map(id => remap.get(id)).filter((x): x is string => !!x))]
  }
  const joinText = (r: Rec) => [str(r.title).trim(), str(r.description).trim()].filter(Boolean).join('\n\n')

  const entries: Entry[] = arr(database.notes, 'note').flatMap((n) => {
    if (!isRec(n) || typeof n.id !== 'string' || !isDateKey(n.date)) return []
    const createdAt = iso(n.createdAt)
    return [{
      id: n.id,
      date: n.date,
      time: nowTime(new Date(createdAt)),
      activityId: null,
      value: null,
      text: joinText(n),
      tagIds: tagsOf(n),
      photoIds: [],
      source: 'import' as const,
      createdAt,
      updatedAt: iso(n.updatedAt ?? createdAt),
    }]
  })

  const activities: Activity[] = arr(database.templates, 'template').flatMap((t, i) => {
    if (!isRec(t) || typeof t.id !== 'string') return []
    const createdAt = iso(t.createdAt)
    return [{
      id: t.id,
      name: str(t.title, 'Attività').trim() || 'Attività',
      icon: 'i-lucide-repeat',
      color: COLORS[i % COLORS.length]!,
      kind: 'check' as const,
      unit: '',
      goal: null,
      step: 1,
      scaleLabels: [],
      choices: [],
      recurrence: { type: 'none' as const },
      startDate: toDateKey(new Date(createdAt)),
      time: null,
      tagIds: tagsOf(t),
      order: i,
      archived: false,
      createdAt,
      updatedAt: iso(t.updatedAt ?? createdAt),
    }]
  })

  const inbox: InboxItem[] = arr(database.todos, 'todo').flatMap((t, i) => {
    if (!isRec(t) || typeof t.id !== 'string') return []
    const createdAt = iso(t.createdAt)
    return [{
      id: t.id,
      title: str(t.title, 'Senza titolo').trim() || 'Senza titolo',
      notes: str(t.description),
      dueDate: null,
      tagIds: tagsOf(t),
      order: i,
      createdAt,
      updatedAt: iso(t.updatedAt ?? createdAt ?? now),
    }]
  })

  return { activities, entries, inbox, tags, preferences: {}, photos: [] }
}
