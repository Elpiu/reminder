import type { Activity, DateKey, Entry } from '../types/models'
import { addDays, daysInMonth, diffDays, fromDateKey, isoWeekday, startOfWeek } from './dates'

type Schedulable = Pick<Activity, 'recurrence' | 'startDate'>
type Completable = Pick<Activity, 'kind' | 'goal'>

/** L'attività è prevista in quel giorno? (`none` non lo è mai; `weekly` lo è ogni giorno finché non raggiunge l'obiettivo settimanale). */
export function isScheduledOn(activity: Schedulable, date: DateKey): boolean {
  if (diffDays(activity.startDate, date) < 0) return false
  const rec = activity.recurrence
  switch (rec.type) {
    case 'none':
      return false
    case 'daily':
    case 'weekly':
      return true
    case 'weekdays':
      return rec.days.includes(isoWeekday(date))
    case 'interval':
      return diffDays(activity.startDate, date) % Math.max(1, rec.every) === 0
    case 'monthly': {
      const d = fromDateKey(date)
      const dim = daysInMonth(d.getFullYear(), d.getMonth())
      return d.getDate() === Math.min(rec.day, dim)
    }
  }
}

/** Il valore registrato soddisfa l'attività? */
export function isComplete(activity: Completable, entry: Pick<Entry, 'value'> | undefined | null): boolean {
  if (!entry) return false
  const v = entry.value
  switch (activity.kind) {
    case 'check':
      return v === true
    case 'counter':
    case 'number':
    case 'duration': {
      if (typeof v !== 'number') return false
      const goal = activity.goal
      if (!goal) return activity.kind === 'counter' ? v > 0 : true
      return goal.op === 'gte' ? v >= goal.target : v <= goal.target
    }
    case 'scale':
      return typeof v === 'number' && v > 0
    case 'choice':
    case 'text':
      return typeof v === 'string' && v.trim().length > 0
  }
}

/** Avanzamento 0..1 per anelli e barre. */
export function progressOf(activity: Completable, entry: Pick<Entry, 'value'> | undefined | null): number {
  if (!entry) return 0
  const goal = activity.goal
  if (typeof entry.value === 'number' && goal && goal.op === 'gte' && goal.target > 0) {
    return Math.max(0, Math.min(1, entry.value / goal.target))
  }
  return isComplete(activity, entry) ? 1 : 0
}

export type DayStatus = 'done' | 'pending' | 'weekDone'

export interface DayItem<A extends Activity = Activity> {
  activity: A
  entry: Entry | undefined
  status: DayStatus
  /** Solo per `weekly`: completamenti nella settimana del giorno. */
  weekCount?: number
}

/**
 * Divide le attività attive di un giorno in "previste" e "facoltative".
 * `entries` sono le voci con activityId della settimana che contiene `date` (servono per `weekly`).
 */
export function planDay(
  activities: Activity[],
  date: DateKey,
  entries: Entry[],
  weekStart: 1 | 7 = 1,
): { scheduled: DayItem[], optional: DayItem[] } {
  const scheduled: DayItem[] = []
  const optional: DayItem[] = []
  const weekFrom = startOfWeek(date, weekStart)
  const weekTo = addDays(weekFrom, 6)

  for (const activity of activities) {
    if (activity.archived) continue
    const entry = entries.find(e => e.activityId === activity.id && e.date === date)
    const done = isComplete(activity, entry)

    if (activity.recurrence.type === 'weekly') {
      if (diffDays(activity.startDate, date) < 0) {
        optional.push({ activity, entry, status: done ? 'done' : 'pending' })
        continue
      }
      const weekCount = entries.filter(e =>
        e.activityId === activity.id && e.date >= weekFrom && e.date <= weekTo && isComplete(activity, e),
      ).length
      const status: DayStatus = done ? 'done' : weekCount >= activity.recurrence.times ? 'weekDone' : 'pending'
      scheduled.push({ activity, entry, status, weekCount })
      continue
    }

    if (isScheduledOn(activity, date)) scheduled.push({ activity, entry, status: done ? 'done' : 'pending' })
    else optional.push({ activity, entry, status: done ? 'done' : 'pending' })
  }

  const byOrder = (a: DayItem, b: DayItem) =>
    (a.activity.time ?? '99').localeCompare(b.activity.time ?? '99') || a.activity.order - b.activity.order
  scheduled.sort(byOrder)
  optional.sort(byOrder)
  return { scheduled, optional }
}

export interface ActivityStats {
  currentStreak: number
  bestStreak: number
  /** Unità della serie: giorni, o settimane per `weekly`. */
  streakUnit: 'days' | 'weeks'
  /** Occasioni previste e completate nel periodo. */
  expected: number
  completed: number
  rate: number
  /** Giorni con almeno una registrazione completa. */
  doneDays: Set<DateKey>
}

/**
 * Statistiche di un'attività fra `from` e `to` (inclusi). Le serie sono calcolate su tutto lo storico fino a `to`.
 * Il giorno `to` non ancora completato non interrompe la serie in corso.
 */
export function activityStats(
  activity: Activity,
  entries: Entry[],
  from: DateKey,
  to: DateKey,
  weekStart: 1 | 7 = 1,
): ActivityStats {
  const own = entries.filter(e => e.activityId === activity.id)
  const doneDays = new Set(own.filter(e => isComplete(activity, e)).map(e => e.date))
  const firstEntry = own.reduce<DateKey | null>((min, e) => (min === null || e.date < min ? e.date : min), null)
  const start = firstEntry && firstEntry < activity.startDate ? firstEntry : activity.startDate

  if (activity.recurrence.type === 'weekly') {
    const times = Math.max(1, activity.recurrence.times)
    const weekMet = (weekKey: DateKey) => {
      let c = 0
      for (let i = 0; i < 7; i++) if (doneDays.has(addDays(weekKey, i))) c++
      return c >= times
    }
    const weeks: DateKey[] = []
    for (let w = startOfWeek(start, weekStart); w <= to; w = addDays(w, 7)) weeks.push(w)
    const { current, best } = streaks(weeks.map(weekMet))
    const inRange = weeks.filter(w => addDays(w, 6) >= from && w <= to)
    const met = inRange.filter(weekMet).length
    return {
      currentStreak: current,
      bestStreak: best,
      streakUnit: 'weeks',
      expected: inRange.length,
      completed: met,
      rate: inRange.length ? met / inRange.length : 0,
      doneDays,
    }
  }

  if (activity.recurrence.type === 'none') {
    const days: boolean[] = []
    for (let d = start; d <= to; d = addDays(d, 1)) days.push(doneDays.has(d))
    const { current, best } = streaks(days)
    let completed = 0
    for (const d of doneDays) if (d >= from && d <= to) completed++
    const span = Math.max(1, diffDays(from > start ? from : start, to) + 1)
    return { currentStreak: current, bestStreak: best, streakUnit: 'days', expected: span, completed, rate: completed / span, doneDays }
  }

  const occasions: boolean[] = []
  let expected = 0
  let completed = 0
  for (let d = start; d <= to; d = addDays(d, 1)) {
    const scheduled = isScheduledOn(activity, d)
    const done = doneDays.has(d)
    if (!scheduled && !done) continue
    occasions.push(done)
    if (d >= from && scheduled) {
      expected++
      if (done) completed++
    }
  }
  const { current, best } = streaks(occasions)
  return {
    currentStreak: current,
    bestStreak: best,
    streakUnit: 'days',
    expected,
    completed,
    rate: expected ? Math.min(1, completed / expected) : 0,
    doneDays,
  }
}

/** Serie corrente (l'ultima occasione mancata non la interrompe, perché può essere ancora in corso) e migliore. */
export function streaks(occasions: boolean[]): { current: number, best: number } {
  let best = 0
  let run = 0
  for (const ok of occasions) {
    run = ok ? run + 1 : 0
    best = Math.max(best, run)
  }
  let current = 0
  let i = occasions.length - 1
  if (i >= 0 && !occasions[i]) i--
  for (; i >= 0 && occasions[i]; i--) current++
  return { current, best }
}
