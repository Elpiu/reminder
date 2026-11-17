import Dexie, { type EntityTable } from 'dexie'
import type { Activity, Entry, InboxItem, Photo, Preferences, Tag } from '#shared/types/models'

export interface SettingRow {
  key: 'preferences'
  value: Partial<Preferences>
}

export class ReminderDB extends Dexie {
  activities!: EntityTable<Activity, 'id'>
  entries!: EntityTable<Entry, 'id'>
  inbox!: EntityTable<InboxItem, 'id'>
  tags!: EntityTable<Tag, 'id'>
  photos!: EntityTable<Photo, 'id'>
  settings!: EntityTable<SettingRow, 'key'>

  constructor() {
    super('reminder-v2')
    this.version(1).stores({
      activities: 'id, order',
      entries: 'id, date, activityId, [activityId+date], *tagIds',
      inbox: 'id, order, dueDate',
      tags: 'id, name',
      photos: 'id',
      settings: 'key',
    })
  }
}

let instance: ReminderDB | null = null

export function useDb(): ReminderDB {
  if (!instance) instance = new ReminderDB()
  return instance
}

export function newId(prefix: string): string {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    : Math.random().toString(36).slice(2, 18)
  return `${prefix}_${rand}`
}
