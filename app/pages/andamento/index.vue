<script setup lang="ts">
import type { Entry } from '#shared/types/models'
import { LazyActivityEditor } from '#components'

useHead({ title: 'Andamento' })

const { prefs } = usePreferences()
const { data: activities, ready } = useActivities()
const editor = useOverlay().create(LazyActivityEditor)

const period = ref('30')
const periods = [
  { label: '7 giorni', value: '7' },
  { label: '30 giorni', value: '30' },
  { label: '3 mesi', value: '90' },
  { label: 'Anno', value: '365' },
]

const today = todayKey()
const from = computed(() => addDays(today, -(Number(period.value) - 1)))
// per le serie servono tutte le voci delle attività; le note solo per il conteggio
const { data: entries } = useLiveQuery(() => useDb().entries.toArray(), [], [] as Entry[])

const active = computed(() => activities.value.filter(a => !a.archived))

const rows = computed(() => active.value.map((a) => {
  const s = activityStats(a, entries.value, from.value, today, prefs.value.weekStart)
  const heat = new Map<string, number>()
  for (const d of s.doneDays) heat.set(d, 1)
  return { activity: a, stats: s, heat }
}))

const overall = computed(() => {
  const exp = rows.value.reduce((n, r) => n + (r.activity.recurrence.type === 'none' ? 0 : r.stats.expected), 0)
  const done = rows.value.reduce((n, r) => n + (r.activity.recurrence.type === 'none' ? 0 : r.stats.completed), 0)
  return exp ? Math.round((done / exp) * 100) : null
})
const notesCount = computed(() => entries.value.filter(e => !e.activityId && e.date >= from.value && e.date <= today).length)
const bestStreak = computed(() => rows.value.reduce<null | (typeof rows.value)[number]>((best, r) => (!best || r.stats.currentStreak > best.stats.currentStreak ? r : best), null))
</script>

<template>
  <div>
    <AppHeader title="Andamento" />
    <main class="space-y-6 px-4 pb-6 pt-4">
      <UTabs v-model="period" :items="periods" :content="false" size="sm" class="w-full" />

      <dl class="grid grid-cols-3 gap-2">
        <div class="rounded-xl border border-default bg-elevated/40 p-3">
          <dt class="text-xs text-muted">
            Completamento
          </dt>
          <dd class="font-serif text-2xl font-semibold text-highlighted">
            {{ overall === null ? '–' : `${overall}%` }}
          </dd>
        </div>
        <div class="rounded-xl border border-default bg-elevated/40 p-3">
          <dt class="text-xs text-muted">
            Serie migliore
          </dt>
          <dd class="font-serif text-2xl font-semibold text-highlighted">
            {{ bestStreak?.stats.currentStreak ?? 0 }}
          </dd>
          <dd v-if="bestStreak && bestStreak.stats.currentStreak" class="truncate text-xs text-muted">
            {{ bestStreak.activity.name }}
          </dd>
        </div>
        <div class="rounded-xl border border-default bg-elevated/40 p-3">
          <dt class="text-xs text-muted">
            Note
          </dt>
          <dd class="font-serif text-2xl font-semibold text-highlighted">
            {{ notesCount }}
          </dd>
        </div>
      </dl>

      <section v-if="rows.length" aria-labelledby="act-title">
        <h2 id="act-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Attività
        </h2>
        <ul class="space-y-2">
          <li v-for="r in rows" :key="r.activity.id">
            <NuxtLink
              :to="`/andamento/${r.activity.id}`"
              class="block rounded-xl border border-default bg-elevated/40 p-3 transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div class="flex items-center gap-3">
                <ActivityIcon :icon="r.activity.icon" :color="r.activity.color" size="sm" />
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium text-highlighted">
                    {{ r.activity.name }}
                  </p>
                  <p class="truncate text-xs text-muted">
                    {{ recurrenceLabel(r.activity.recurrence) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold tabular-nums text-highlighted">
                    {{ r.activity.recurrence.type === 'none' ? `${r.stats.completed}×` : `${Math.round(r.stats.rate * 100)}%` }}
                  </p>
                  <p v-if="r.stats.currentStreak" class="flex items-center justify-end gap-0.5 text-xs text-muted">
                    <UIcon name="i-lucide-flame" class="size-3 text-orange-500" />{{ r.stats.currentStreak }} {{ r.stats.streakUnit }}
                  </p>
                </div>
              </div>
              <Heatmap class="mt-3" :to="today" :weeks="17" :values="r.heat" :color="activityColor(r.activity.color)" :week-start="prefs.weekStart" />
            </NuxtLink>
          </li>
        </ul>
      </section>

      <UEmpty
        v-else-if="ready"
        icon="i-lucide-chart-no-axes-column"
        title="Niente da mostrare"
        description="Crea un'attività e registrala per qualche giorno: qui vedrai serie e progressi."
        :actions="[{ label: 'Nuova attività', icon: 'i-lucide-plus', onClick: () => { editor.open({}) } }]"
        variant="naked"
      />
    </main>
  </div>
</template>
