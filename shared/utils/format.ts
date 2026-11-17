import type { Activity, DateKey, EntryValue } from '../types/models'
import { formatDuration, fromDateKey, todayKey, addDays } from './dates'

const numberFmt = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 })

/** Valore leggibile ("8 bicchieri", "1 h 30 min", "🙂"); stringa vuota se non c'è valore. */
export function formatValue(activity: Pick<Activity, 'kind' | 'unit' | 'scaleLabels'>, value: EntryValue): string {
  if (value === null || value === undefined || value === '') return ''
  switch (activity.kind) {
    case 'check':
      return value === true ? 'Fatto' : ''
    case 'duration':
      return typeof value === 'number' ? formatDuration(value) : ''
    case 'scale':
      return typeof value === 'number' ? (activity.scaleLabels[value - 1] ?? String(value)) : ''
    case 'counter':
    case 'number':
      return typeof value === 'number' ? `${numberFmt.format(value)}${activity.unit ? ` ${activity.unit}` : ''}` : ''
    default:
      return String(value)
  }
}

export function formatNumber(n: number): string {
  return numberFmt.format(n)
}

const longFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
const longYearFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' })

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "Oggi", "Ieri", "Domani" o "Martedì 17 novembre" (con anno se diverso da quello corrente). */
export function formatDayTitle(key: DateKey): string {
  const today = todayKey()
  if (key === today) return 'Oggi'
  if (key === addDays(today, -1)) return 'Ieri'
  if (key === addDays(today, 1)) return 'Domani'
  const d = fromDateKey(key)
  return cap((d.getFullYear() === new Date().getFullYear() ? longFmt : longYearFmt).format(d))
}

export function formatLongDate(key: DateKey): string {
  return cap(longYearFmt.format(fromDateKey(key)))
}

export function formatShortDate(key: DateKey): string {
  return shortFmt.format(fromDateKey(key))
}
