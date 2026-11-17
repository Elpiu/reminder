import type { DateKey } from '../types/models'

const pad = (n: number) => String(n).padStart(2, '0')

export function toDateKey(date: Date = new Date()): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Mezzogiorno locale: evita sorprese con i cambi d'ora. */
export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1, 12)
}

export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return toDateKey(fromDateKey(value)) === value
}

export function todayKey(): DateKey {
  return toDateKey(new Date())
}

export function nowTime(date: Date = new Date()): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

/** Giorni da `from` a `to` (positivo se `to` è dopo). */
export function diffDays(from: DateKey, to: DateKey): number {
  const a = fromDateKey(from)
  const b = fromDateKey(to)
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((utcB - utcA) / 86_400_000)
}

/** 1 = lunedì … 7 = domenica. */
export function isoWeekday(key: DateKey): number {
  const day = fromDateKey(key).getDay()
  return day === 0 ? 7 : day
}

export function startOfWeek(key: DateKey, weekStart: 1 | 7 = 1): DateKey {
  const wd = isoWeekday(key)
  const offset = weekStart === 1 ? wd - 1 : wd % 7
  return addDays(key, -offset)
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function rangeKeys(from: DateKey, to: DateKey): DateKey[] {
  const out: DateKey[] = []
  const n = diffDays(from, to)
  for (let i = 0; i <= n; i++) out.push(addDays(from, i))
  return out
}

/** Giorni da mostrare in una griglia mensile (settimane complete). */
export function monthGrid(year: number, month: number, weekStart: 1 | 7 = 1): DateKey[] {
  const first = toDateKey(new Date(year, month, 1, 12))
  const last = toDateKey(new Date(year, month, daysInMonth(year, month), 12))
  const start = startOfWeek(first, weekStart)
  const end = addDays(startOfWeek(last, weekStart), 6)
  return rangeKeys(start, end)
}

/** Minuti → "1 h 30 min". */
export function formatDuration(minutes: number): string {
  const m = Math.round(minutes)
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h && r) return `${h} h ${r} min`
  if (h) return `${h} h`
  return `${r} min`
}
