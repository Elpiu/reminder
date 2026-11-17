import { describe, expect, it } from 'vitest'
import type { Activity, Entry, Recurrence } from '../shared/types/models'
import { activityStats, isComplete, isScheduledOn, planDay, progressOf, streaks } from '../shared/utils/recurrence'
import { addDays, monthGrid, startOfWeek } from '../shared/utils/dates'

function activity(over: Partial<Activity> = {}): Activity {
  return {
    id: 'a1', name: 'Test', icon: 'i-lucide-star', color: 'teal', kind: 'check', unit: '', goal: null, step: 1,
    scaleLabels: [], choices: [], recurrence: { type: 'daily' }, startDate: '2026-11-02', time: null, tagIds: [],
    order: 0, archived: false, createdAt: '', updatedAt: '', ...over,
  }
}

function entry(date: string, value: Entry['value'], activityId = 'a1'): Entry {
  return { id: `${activityId}-${date}`, date, time: '10:00', activityId, value, text: '', tagIds: [], photoIds: [], source: 'manual', createdAt: '', updatedAt: '' }
}

const sched = (recurrence: Recurrence, date: string, startDate = '2026-11-02') =>
  isScheduledOn({ recurrence, startDate }, date)

describe('isScheduledOn', () => {
  it('daily dopo la data di inizio', () => {
    expect(sched({ type: 'daily' }, '2026-11-17')).toBe(true)
    expect(sched({ type: 'daily' }, '2026-11-01')).toBe(false)
  })
  it('none mai previsto', () => {
    expect(sched({ type: 'none' }, '2026-11-17')).toBe(false)
  })
  it('giorni della settimana ISO', () => {
    // 2026-11-17 è martedì
    expect(sched({ type: 'weekdays', days: [2] }, '2026-11-17')).toBe(true)
    expect(sched({ type: 'weekdays', days: [1, 3] }, '2026-11-17')).toBe(false)
    expect(sched({ type: 'weekdays', days: [7] }, '2026-11-22')).toBe(true)
  })
  it('ogni N giorni dalla data di inizio', () => {
    expect(sched({ type: 'interval', every: 3 }, '2026-11-02')).toBe(true)
    expect(sched({ type: 'interval', every: 3 }, '2026-11-05')).toBe(true)
    expect(sched({ type: 'interval', every: 3 }, '2026-11-06')).toBe(false)
  })
  it('giorno del mese, con fine mese per i mesi corti', () => {
    expect(sched({ type: 'monthly', day: 17 }, '2026-11-17')).toBe(true)
    expect(sched({ type: 'monthly', day: 31 }, '2026-11-30')).toBe(true)
    expect(sched({ type: 'monthly', day: 31 }, '2026-11-29')).toBe(false)
  })
})

describe('isComplete / progressOf', () => {
  it('check', () => {
    expect(isComplete(activity(), entry('2026-11-17', true))).toBe(true)
    expect(isComplete(activity(), entry('2026-11-17', false))).toBe(false)
    expect(isComplete(activity(), undefined)).toBe(false)
  })
  it('contatore con obiettivo minimo', () => {
    const a = activity({ kind: 'counter', goal: { op: 'gte', target: 8 } })
    expect(isComplete(a, entry('d', 5))).toBe(false)
    expect(progressOf(a, entry('d', 4))).toBe(0.5)
    expect(isComplete(a, entry('d', 8))).toBe(true)
  })
  it('numero con obiettivo massimo', () => {
    const a = activity({ kind: 'number', goal: { op: 'lte', target: 2 } })
    expect(isComplete(a, entry('d', 3))).toBe(false)
    expect(isComplete(a, entry('d', 1))).toBe(true)
  })
  it('scelta e testo richiedono un valore', () => {
    expect(isComplete(activity({ kind: 'text' }), entry('d', '  '))).toBe(false)
    expect(isComplete(activity({ kind: 'choice' }), entry('d', 'Corsa'))).toBe(true)
  })
})

describe('streaks', () => {
  it('l\'ultima occasione mancata non interrompe la serie in corso', () => {
    expect(streaks([true, true, false, true, true, false])).toEqual({ current: 2, best: 2 })
    expect(streaks([true, true, true])).toEqual({ current: 3, best: 3 })
    expect(streaks([true, false, false])).toEqual({ current: 0, best: 1 })
  })
})

describe('planDay', () => {
  it('separa previste e facoltative e segna weekly completata', () => {
    const daily = activity({ id: 'd' })
    const free = activity({ id: 'f', recurrence: { type: 'none' } })
    const weekly = activity({ id: 'w', recurrence: { type: 'weekly', times: 2 } })
    const entries = [entry('2026-11-16', true, 'w'), entry('2026-11-17', true, 'w'), entry('2026-11-17', true, 'd')]
    const plan = planDay([daily, free, weekly], '2026-11-18', entries)
    expect(plan.scheduled.map(i => i.activity.id).sort()).toEqual(['d', 'w'])
    expect(plan.scheduled.find(i => i.activity.id === 'w')?.status).toBe('weekDone')
    expect(plan.scheduled.find(i => i.activity.id === 'd')?.status).toBe('pending')
    expect(plan.optional.map(i => i.activity.id)).toEqual(['f'])
  })
  it('esclude le attività archiviate', () => {
    expect(planDay([activity({ archived: true })], '2026-11-17', []).scheduled).toHaveLength(0)
  })
})

describe('activityStats', () => {
  it('daily: serie e percentuale', () => {
    const a = activity({ startDate: '2026-11-10' })
    const entries = ['2026-11-10', '2026-11-11', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16'].map(d => entry(d, true))
    const s = activityStats(a, entries, '2026-11-10', '2026-11-17')
    expect(s.currentStreak).toBe(4)
    expect(s.bestStreak).toBe(4)
    expect(s.expected).toBe(8)
    expect(s.completed).toBe(6)
  })
  it('weekly: serie in settimane', () => {
    const a = activity({ startDate: '2026-11-02', recurrence: { type: 'weekly', times: 2 } })
    const entries = ['2026-11-02', '2026-11-04', '2026-11-09', '2026-11-12'].map(d => entry(d, true))
    const s = activityStats(a, entries, '2026-11-02', '2026-11-17')
    expect(s.streakUnit).toBe('settimane')
    expect(s.currentStreak).toBe(2)
    expect(s.completed).toBe(2)
    expect(s.expected).toBe(3)
  })
})

describe('date', () => {
  it('griglia mensile a settimane complete', () => {
    const grid = monthGrid(2026, 10, 1) // novembre 2026
    expect(grid.length % 7).toBe(0)
    expect(grid[0]).toBe('2026-10-26')
    expect(grid.at(-1)).toBe('2026-12-06')
  })
  it('inizio settimana lunedì o domenica', () => {
    expect(startOfWeek('2026-11-17', 1)).toBe('2026-11-16')
    expect(startOfWeek('2026-11-17', 7)).toBe('2026-11-15')
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26')
  })
})
