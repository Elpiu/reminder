import type { Activity, DateKey, Entry, EntryValue, InboxItem, Tag } from '#shared/types/models'
import type { ActivityPreset as Preset } from '#shared/utils/catalog'

const stamp = () => new Date().toISOString()

/** Traduzione per i messaggi dei toast (le azioni girano fuori dai componenti). */
const tr = (key: string, params: Record<string, unknown> = {}) => useNuxtApp().$i18n.t(key, params)

/** Copia profonda di dati JSON, sicura anche con oggetti reattivi di Vue (che structuredClone rifiuta). */
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

// ---------------------------------------------------------------- attività

export type ActivityDraft = Omit<Activity, 'id' | 'order' | 'archived' | 'createdAt' | 'updatedAt'>

export function emptyActivityDraft(): ActivityDraft {
  return {
    name: '',
    icon: 'i-lucide-circle-check',
    color: 'teal',
    kind: 'check',
    unit: '',
    goal: null,
    step: 1,
    scaleLabels: [...MOOD_LABELS],
    choices: [],
    recurrence: { type: 'daily' },
    startDate: todayKey(),
    time: null,
    tagIds: [],
  }
}

export async function createActivity(draft: ActivityDraft): Promise<Activity> {
  const db = useDb()
  const last = await db.activities.orderBy('order').last()
  const now = stamp()
  const activity: Activity = {
    ...plain(draft),
    id: newId('act'),
    order: (last?.order ?? -1) + 1,
    archived: false,
    createdAt: now,
    updatedAt: now,
  }
  await db.activities.add(activity)
  return activity
}

export async function updateActivity(id: string, patch: Partial<Activity>): Promise<void> {
  await useDb().activities.update(id, { ...plain(patch), updatedAt: stamp() })
}

export async function addPresetActivities(presets: Preset[]): Promise<void> {
  for (const p of presets) await createActivity({ ...plain(p), startDate: todayKey(), tagIds: [] })
}

export async function setArchived(activity: Activity, archived: boolean): Promise<void> {
  await updateActivity(activity.id, { archived })
  useToast().add({
    title: archived ? tr('toast.archived', { name: activity.name }) : tr('toast.restored', { name: activity.name }),
    icon: archived ? 'i-lucide-archive' : 'i-lucide-archive-restore',
    actions: [{ label: tr('common.undo'), color: 'neutral', variant: 'outline', onClick: () => { void updateActivity(activity.id, { archived: !archived }) } }],
  })
}

/** Elimina l'attività e tutte le sue registrazioni (con possibilità di annullare). */
export async function deleteActivity(activity: Activity): Promise<void> {
  const db = useDb()
  const entries = await db.entries.where('activityId').equals(activity.id).toArray()
  await db.transaction('rw', db.activities, db.entries, async () => {
    await db.activities.delete(activity.id)
    await db.entries.bulkDelete(entries.map(e => e.id))
  })
  undoToast(tr('toast.deleted', { name: activity.name }), async () => {
    await db.transaction('rw', db.activities, db.entries, async () => {
      await db.activities.put(activity)
      await db.entries.bulkPut(entries)
    })
  })
}

export async function reorderActivities(ids: string[]): Promise<void> {
  const db = useDb()
  await db.transaction('rw', db.activities, async () => {
    await Promise.all(ids.map((id, order) => db.activities.update(id, { order })))
  })
}

// ---------------------------------------------------------------- voci

/** Imposta (o rimuove con `null`) il valore di un'attività in un giorno: una sola voce per attività e giorno. */
export async function setActivityValue(activity: Activity, date: DateKey, value: EntryValue, text?: string): Promise<void> {
  const db = useDb()
  await db.transaction('rw', db.entries, () => writeActivityValue(activity, date, value, text))
}

async function writeActivityValue(activity: Activity, date: DateKey, value: EntryValue, text?: string): Promise<void> {
  const db = useDb()
  const existing = await db.entries.where('[activityId+date]').equals([activity.id, date]).first()
  const empty = value === null || value === false || value === '' || (typeof value === 'number' && value <= 0 && activity.kind === 'counter')
  if (existing) {
    if (empty && !(text ?? existing.text) && !existing.photoIds.length) {
      await db.entries.delete(existing.id)
      return
    }
    await db.entries.update(existing.id, { value: empty ? null : value, ...(text !== undefined ? { text } : {}), updatedAt: stamp() })
    return
  }
  if (empty && !text) return
  const now = stamp()
  await db.entries.add({
    id: newId('ent'),
    date,
    time: date === todayKey() ? nowTime() : (activity.time ?? '12:00'),
    activityId: activity.id,
    value: empty ? null : value,
    text: text ?? '',
    tagIds: [...activity.tagIds],
    photoIds: [],
    source: 'manual',
    createdAt: now,
    updatedAt: now,
  })
}

export async function incrementCounter(activity: Activity, date: DateKey, delta: number): Promise<void> {
  const db = useDb()
  // lettura e scrittura nella stessa transazione: tap ravvicinati non si perdono
  await db.transaction('rw', db.entries, async () => {
    const existing = await db.entries.where('[activityId+date]').equals([activity.id, date]).first()
    const current = typeof existing?.value === 'number' ? existing.value : 0
    await writeActivityValue(activity, date, Math.max(0, current + delta))
  })
}

export interface NoteDraft {
  date: DateKey
  time: string
  text: string
  tagIds: string[]
  photoIds: string[]
}

export async function createNote(draft: NoteDraft, source: Entry['source'] = 'manual'): Promise<Entry> {
  const now = stamp()
  const entry: Entry = {
    id: newId('ent'),
    date: draft.date,
    time: draft.time,
    activityId: null,
    value: null,
    text: draft.text.trim(),
    tagIds: [...draft.tagIds],
    photoIds: [...draft.photoIds],
    source,
    createdAt: now,
    updatedAt: now,
  }
  await useDb().entries.add(entry)
  return entry
}

export async function updateEntry(id: string, patch: Partial<Entry>): Promise<void> {
  const db = useDb()
  const before = await db.entries.get(id)
  await db.entries.update(id, { ...plain(patch), updatedAt: stamp() })
  // foto tolte dalla voce: non servono più
  if (before && patch.photoIds) {
    const removed = before.photoIds.filter(p => !patch.photoIds!.includes(p))
    if (removed.length) await db.photos.bulkDelete(removed)
  }
}

export async function deleteEntry(entry: Entry): Promise<void> {
  const db = useDb()
  const photos = entry.photoIds.length ? (await db.photos.bulkGet(entry.photoIds)).filter(p => !!p) : []
  await db.transaction('rw', db.entries, db.photos, async () => {
    await db.entries.delete(entry.id)
    await db.photos.bulkDelete(entry.photoIds)
  })
  undoToast(entry.activityId ? tr('toast.entryDeleted') : tr('toast.noteDeleted'), async () => {
    await db.transaction('rw', db.entries, db.photos, async () => {
      await db.entries.put(entry)
      if (photos.length) await db.photos.bulkPut(photos)
    })
  })
}

// ---------------------------------------------------------------- inbox

export async function createInboxItem(title: string, dueDate: DateKey | null = null, tagIds: string[] = []): Promise<void> {
  const db = useDb()
  const first = await db.inbox.orderBy('order').first()
  const now = stamp()
  await db.inbox.add({
    id: newId('inb'),
    title: title.trim(),
    notes: '',
    dueDate,
    tagIds,
    order: (first?.order ?? 1) - 1,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateInboxItem(id: string, patch: Partial<InboxItem>): Promise<void> {
  await useDb().inbox.update(id, { ...plain(patch), updatedAt: stamp() })
}

/** Completa un elemento: diventa una voce del diario nel giorno indicato (default oggi). */
export async function completeInboxItem(item: InboxItem, date: DateKey = todayKey()): Promise<void> {
  const db = useDb()
  let created: Entry | undefined
  await db.transaction('rw', db.inbox, db.entries, async () => {
    await db.inbox.delete(item.id)
    created = await createNote({
      date,
      time: date === todayKey() ? nowTime() : '12:00',
      text: `✓ ${item.title}${item.notes ? `\n\n${item.notes}` : ''}`,
      tagIds: item.tagIds,
      photoIds: [],
    }, 'inbox')
  })
  useToast().add({
    title: tr('toast.inboxDone'),
    icon: 'i-lucide-circle-check',
    color: 'success',
    actions: [{
      label: tr('common.undo'), color: 'neutral', variant: 'outline',
      onClick: () => {
        void db.transaction('rw', db.inbox, db.entries, async () => {
          if (created) await db.entries.delete(created.id)
          await db.inbox.put(item)
        })
      },
    }],
  })
}

export async function deleteInboxItem(item: InboxItem): Promise<void> {
  await useDb().inbox.delete(item.id)
  undoToast(tr('toast.inboxDeleted'), async () => {
    await useDb().inbox.put(item)
  })
}

// ---------------------------------------------------------------- tag

export async function ensureTag(name: string): Promise<Tag> {
  const db = useDb()
  const clean = name.trim().replace(/^#/, '')
  const all = await db.tags.toArray()
  const found = all.find(t => t.name.toLowerCase() === clean.toLowerCase())
  if (found) return found
  const tag: Tag = { id: newId('tag'), name: clean, createdAt: stamp() }
  await db.tags.add(tag)
  return tag
}

export async function renameTag(id: string, name: string): Promise<void> {
  await useDb().tags.update(id, { name: name.trim().replace(/^#/, '') })
}

/** Elimina un tag e lo toglie da voci, inbox e attività. */
export async function deleteTag(tag: Tag): Promise<void> {
  const db = useDb()
  const without = <T extends { tagIds: string[] }>(x: T) => {
    x.tagIds = x.tagIds.filter(t => t !== tag.id)
  }
  await db.transaction('rw', [db.tags, db.entries, db.inbox, db.activities], async () => {
    await db.tags.delete(tag.id)
    await db.entries.where('tagIds').equals(tag.id).modify(without)
    await db.inbox.filter(i => i.tagIds.includes(tag.id)).modify(without)
    await db.activities.filter(a => a.tagIds.includes(tag.id)).modify(without)
  })
}

// ---------------------------------------------------------------- util

export function undoToast(title: string, restore: () => Promise<void>) {
  useToast().add({
    title,
    icon: 'i-lucide-trash-2',
    duration: 6000,
    actions: [{ label: tr('common.undo'), color: 'neutral', variant: 'outline', onClick: () => { void restore() } }],
  })
}

