<script setup lang="ts">
import type { Activity, Entry } from '#shared/types/models'
import { LazyActivityEditor } from '#components'

const route = useRoute()
const id = computed(() => String(route.params.id))
const { prefs } = usePreferences()
const editor = useOverlay().create(LazyActivityEditor)

const { data: activity, ready } = useLiveQuery(() => useDb().activities.get(id.value), [id], undefined as Activity | undefined)
const { data: entries } = useLiveQuery(
  () => useDb().entries.where('activityId').equals(id.value).sortBy('date'),
  [id],
  [] as Entry[],
)

const f = useFmt()
const { t } = f
useHead({ title: () => activity.value?.name ?? t('progress.activities') })

const period = ref('30')
const periods = computed(() => ['7', '30', '90', '365'].map(value => ({ label: t(`progress.p${value}`), value })))
const today = todayKey()
const from = computed(() => addDays(today, -(Number(period.value) - 1)))

const stats = computed(() => activity.value ? activityStats(activity.value, entries.value, from.value, today, prefs.value.weekStart) : null)

const heat = computed(() => {
  const a = activity.value
  const m = new Map<string, number>()
  if (!a) return m
  for (const e of entries.value) {
    const p = progressOf(a, e)
    if (p > 0 || e.value !== null) m.set(e.date, Math.max(0.15, p))
  }
  return m
})

const numeric = computed(() => !!activity.value && ['counter', 'number', 'duration', 'scale'].includes(activity.value.kind))

const chart = computed(() => {
  const a = activity.value
  if (!a) return []
  const byDate = new Map(entries.value.map(e => [e.date, e]))
  const days = rangeKeys(from.value, today)
  // oltre i 90 giorni: media settimanale
  if (days.length > 90) {
    const out: { label: string, value: number | null }[] = []
    for (let i = 0; i < days.length; i += 7) {
      const vals = days.slice(i, i + 7).map(d => byDate.get(d)?.value).filter((v): v is number => typeof v === 'number')
      out.push({ label: f.shortDate(days[i]!), value: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null })
    }
    return out
  }
  return days.map((d) => {
    const v = byDate.get(d)?.value
    return { label: String(fromDateKey(d).getDate()), value: typeof v === 'number' ? v : null }
  })
})

const choiceCounts = computed(() => {
  const a = activity.value
  if (!a || a.kind !== 'choice') return []
  const counts = new Map<string, number>()
  for (const e of entries.value) if (typeof e.value === 'string' && e.date >= from.value) counts.set(e.value, (counts.get(e.value) ?? 0) + 1)
  const total = [...counts.values()].reduce((s, n) => s + n, 0)
  return [...counts.entries()].sort((x, y) => y[1] - x[1]).map(([label, n]) => ({ label, n, pct: total ? n / total : 0 }))
})

const recent = computed(() => [...entries.value].reverse().slice(0, 30))
const fmt = (v: number) => activity.value ? f.value(activity.value, Math.round(v * 100) / 100) || String(v) : String(v)

const menu = computed(() => activity.value
  ? [[
      { label: t('common.edit'), icon: 'i-lucide-pencil', onSelect: () => editor.open({ activity: activity.value }) },
      { label: activity.value.archived ? t('progress.restore') : t('progress.archive'), icon: 'i-lucide-archive', onSelect: () => setArchived(activity.value!, !activity.value!.archived) },
    ], [
      { label: t('progress.deleteAll'), icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: async () => {
        await deleteActivity(activity.value!)
        navigateTo('/andamento')
      } },
    ]]
  : [])
</script>

<template>
  <div>
    <AppHeader :title="activity?.name ?? $t('progress.activities')" :subtitle="activity ? f.recurrence(activity.recurrence) : undefined" back="/andamento">
      <template #actions>
        <UDropdownMenu v-if="activity" :items="menu" :content="{ align: 'end' }">
          <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" :aria-label="$t('progress.actionsAria')" />
        </UDropdownMenu>
      </template>
    </AppHeader>

    <main v-if="activity && stats" class="space-y-6 px-4 pb-6 pt-4">
      <div class="flex items-center gap-3">
        <ActivityIcon :icon="activity.icon" :color="activity.color" size="lg" />
        <div class="min-w-0 flex-1">
          <p class="text-sm text-muted">
            {{ f.kindLabel(activity.kind) }}<template v-if="activity.goal">
              · {{ $t('progress.goal', { op: activity.goal.op === 'gte' ? '≥' : '≤', value: f.value(activity, activity.goal.target) }) }}
            </template>
          </p>
          <UBadge v-if="activity.archived" :label="$t('progress.archived')" color="neutral" variant="soft" class="mt-1" />
        </div>
      </div>

      <UTabs v-model="period" :items="periods" :content="false" size="sm" class="w-full" />

      <dl class="grid grid-cols-3 gap-2">
        <div class="rounded-xl border border-default bg-elevated/40 p-3">
          <dt class="text-xs text-muted">
            {{ $t('progress.currentStreak') }}
          </dt>
          <dd class="flex items-baseline gap-1 font-serif text-2xl font-semibold text-highlighted">
            {{ stats.currentStreak }}<UIcon v-if="stats.currentStreak" name="i-lucide-flame" class="size-4 text-orange-500" />
          </dd>
          <dd class="text-xs text-muted">
            {{ f.streakUnit(stats.streakUnit, stats.currentStreak) }}
          </dd>
        </div>
        <div class="rounded-xl border border-default bg-elevated/40 p-3">
          <dt class="text-xs text-muted">
            {{ $t('progress.record') }}
          </dt>
          <dd class="font-serif text-2xl font-semibold text-highlighted">
            {{ stats.bestStreak }}
          </dd>
          <dd class="text-xs text-muted">
            {{ f.streakUnit(stats.streakUnit, stats.bestStreak) }}
          </dd>
        </div>
        <div class="rounded-xl border border-default bg-elevated/40 p-3">
          <dt class="text-xs text-muted">
            {{ activity.recurrence.type === 'none' ? $t('progress.registrations') : $t('progress.completion') }}
          </dt>
          <dd class="font-serif text-2xl font-semibold text-highlighted">
            {{ activity.recurrence.type === 'none' ? stats.completed : `${Math.round(stats.rate * 100)}%` }}
          </dd>
          <dd v-if="activity.recurrence.type !== 'none'" class="text-xs text-muted">
            {{ $t('progress.completedOf', { done: stats.completed, total: stats.expected }) }}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="map-title">
        <h2 id="map-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('progress.lastYear') }}
        </h2>
        <Heatmap :to="today" :weeks="53" :values="heat" :color="activityColor(activity.color)" :week-start="prefs.weekStart" />
      </section>

      <section v-if="numeric" aria-labelledby="chart-title">
        <h2 id="chart-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('progress.values') }}
        </h2>
        <BarChart
          :points="chart"
          :color="activityColor(activity.color)"
          :goal="activity.kind === 'scale' ? null : activity.goal?.target"
          :format="fmt"
        />
      </section>

      <section v-if="choiceCounts.length" aria-labelledby="choice-title">
        <h2 id="choice-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('progress.choices') }}
        </h2>
        <ul class="space-y-2">
          <li v-for="c in choiceCounts" :key="c.label" class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-highlighted">{{ c.label }}</span><span class="tabular-nums text-muted">{{ c.n }}</span>
            </div>
            <UProgress :model-value="c.pct * 100" size="sm" />
          </li>
        </ul>
      </section>

      <section aria-labelledby="hist-title">
        <h2 id="hist-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('progress.recent') }}
        </h2>
        <ul v-if="recent.length" class="divide-y divide-default rounded-xl border border-default">
          <li v-for="e in recent" :key="e.id">
            <NuxtLink :to="{ path: '/', query: e.date === today ? {} : { d: e.date } }" class="flex items-start gap-3 px-3 py-2.5 hover:bg-elevated/50">
              <span class="w-20 shrink-0 text-sm text-muted">{{ f.shortDate(e.date) }}</span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-medium text-highlighted">{{ f.value(activity, e.value) || '—' }}</span>
                <span v-if="e.text" class="diary-text block text-sm text-muted">{{ e.text }}</span>
              </span>
              <UIcon v-if="isComplete(activity, e)" name="i-lucide-check" class="size-4 text-primary" />
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="text-sm text-muted">
          {{ $t('progress.noRecords') }}
        </p>
      </section>
    </main>

    <UEmpty
      v-else-if="ready"
      icon="i-lucide-search-x"
      :title="$t('progress.notFound')"
      :actions="[{ label: $t('progress.back'), to: '/andamento' }]"
      variant="naked"
      class="mt-12"
    />
  </div>
</template>
