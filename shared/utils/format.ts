import type { Activity, DateKey, EntryValue } from '../types/models'
import { addDays, formatDuration, fromDateKey, todayKey } from './dates'

/** Lingua BCP 47 usata da Intl (es. `it-IT`, `en-US`). */
export type IntlLocale = string

const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>()

function numberFmt(locale: IntlLocale): Intl.NumberFormat {
  const key = `n:${locale}`
  if (!cache.has(key)) cache.set(key, new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }))
  return cache.get(key) as Intl.NumberFormat
}

function dateFmt(locale: IntlLocale, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `d:${locale}:${JSON.stringify(opts)}`
  if (!cache.has(key)) cache.set(key, new Intl.DateTimeFormat(locale, opts))
  return cache.get(key) as Intl.DateTimeFormat
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Valore leggibile ("8 bicchieri", "1 h 30 min", "🙂"); stringa vuota se non c'è valore. */
export function formatValue(
  activity: Pick<Activity, 'kind' | 'unit' | 'scaleLabels'>,
  value: EntryValue,
  locale: IntlLocale = 'it-IT',
  doneLabel = '✓',
): string {
  if (value === null || value === undefined || value === '') return ''
  switch (activity.kind) {
    case 'check':
      return value === true ? doneLabel : ''
    case 'duration':
      return typeof value === 'number' ? formatDuration(value) : ''
    case 'scale':
      return typeof value === 'number' ? (activity.scaleLabels[value - 1] ?? String(value)) : ''
    case 'counter':
    case 'number':
      return typeof value === 'number' ? `${numberFmt(locale).format(value)}${activity.unit ? ` ${activity.unit}` : ''}` : ''
    default:
      return String(value)
  }
}

export function formatNumber(n: number, locale: IntlLocale = 'it-IT'): string {
  return numberFmt(locale).format(n)
}

export interface RelativeDayLabels {
  today: string
  yesterday: string
  tomorrow: string
}

/** "Oggi", "Ieri", "Domani" o "Martedì 17 novembre" (con l'anno se diverso da quello corrente). */
export function formatDayTitle(key: DateKey, locale: IntlLocale, labels: RelativeDayLabels): string {
  const today = todayKey()
  if (key === today) return labels.today
  if (key === addDays(today, -1)) return labels.yesterday
  if (key === addDays(today, 1)) return labels.tomorrow
  const d = fromDateKey(key)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return cap(dateFmt(locale, { weekday: 'long', day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }) }).format(d))
}

export function formatLongDate(key: DateKey, locale: IntlLocale = 'it-IT'): string {
  return cap(dateFmt(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(fromDateKey(key)))
}

export function formatShortDate(key: DateKey, locale: IntlLocale = 'it-IT'): string {
  return dateFmt(locale, { day: 'numeric', month: 'short' }).format(fromDateKey(key))
}

export function formatMonthTitle(year: number, month: number, locale: IntlLocale = 'it-IT'): string {
  return cap(dateFmt(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month, 1, 12)))
}

/** Iniziale del giorno della settimana (L, M, …). */
export function formatWeekdayNarrow(key: DateKey, locale: IntlLocale = 'it-IT'): string {
  return dateFmt(locale, { weekday: 'narrow' }).format(fromDateKey(key))
}

export function formatMonthShort(key: DateKey, locale: IntlLocale = 'it-IT'): string {
  return dateFmt(locale, { month: 'short' }).format(fromDateKey(key))
}
