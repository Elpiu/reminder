import type { Activity, DateKey, Entry, InboxItem, Tag } from '#shared/types/models'

/** Tutte le attività in ordine (comprese archiviate). */
export function useActivities() {
  return useLiveQuery(() => useDb().activities.orderBy('order').toArray(), [], [] as Activity[])
}

export function useTags() {
  const { data, ready } = useLiveQuery(
    async () => (await useDb().tags.toArray()).sort((a, b) => a.name.localeCompare(b.name, 'it')),
    [],
    [] as Tag[],
  )
  const byId = computed(() => new Map(data.value.map(t => [t.id, t])))
  return { tags: data, byId, ready }
}

export function useInbox() {
  return useLiveQuery(() => useDb().inbox.orderBy('order').toArray(), [], [] as InboxItem[])
}

/** Dati della vista giorno: piano attività, note e promemoria dell'inbox. */
export function useDay(date: Ref<DateKey>) {
  const { prefs } = usePreferences()
  const { data: activities, ready: activitiesReady } = useActivities()

  const weekFrom = computed(() => startOfWeek(date.value, prefs.value.weekStart))
  const weekTo = computed(() => addDays(weekFrom.value, 6))

  const { data: weekEntries, ready: entriesReady } = useLiveQuery(
    () => useDb().entries.where('date').between(weekFrom.value, weekTo.value, true, true).toArray(),
    [weekFrom],
    [] as Entry[],
  )

  const { data: inboxDue } = useLiveQuery(
    () => useDb().inbox.where('dueDate').belowOrEqual(date.value).sortBy('dueDate'),
    [date],
    [] as InboxItem[],
  )

  const plan = computed(() => planDay(activities.value, date.value, weekEntries.value.filter(e => e.activityId), prefs.value.weekStart))

  const notes = computed(() =>
    weekEntries.value
      .filter(e => e.date === date.value && !e.activityId)
      .sort((a, b) => a.time.localeCompare(b.time) || a.createdAt.localeCompare(b.createdAt)),
  )

  /** Promemoria: in scadenza oggi, o arretrati se si guarda oggi. */
  const reminders = computed(() =>
    inboxDue.value.filter(i => i.dueDate === date.value || (date.value === todayKey() && i.dueDate! < date.value)),
  )

  /** Avanzamento 0..1 di ogni giorno della settimana (per la striscia). */
  const weekProgress = computed(() => {
    const out: Record<DateKey, { ratio: number, notes: number }> = {}
    const acts = activities.value
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekFrom.value, i)
      const p = planDay(acts, d, weekEntries.value.filter(e => e.activityId), prefs.value.weekStart)
      const total = p.scheduled.length
      const done = p.scheduled.filter(s => s.status !== 'pending').length
      out[d] = {
        ratio: total ? done / total : -1,
        notes: weekEntries.value.filter(e => e.date === d && (!e.activityId || p.optional.some(o => o.activity.id === e.activityId))).length,
      }
    }
    return out
  })

  const ready = computed(() => activitiesReady.value && entriesReady.value)

  return { activities, plan, notes, reminders, weekProgress, weekFrom, ready }
}

/** Numero di cose ancora da fare oggi (attività previste + promemoria). */
export function usePendingToday() {
  const today = ref(todayKey())
  const { plan, reminders } = useDay(today)
  const refreshDay = () => {
    today.value = todayKey()
  }
  return {
    count: computed(() => plan.value.scheduled.filter(i => i.status === 'pending').length + reminders.value.length),
    refreshDay,
  }
}
