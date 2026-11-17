<script setup lang="ts">
import type { DateKey, Entry } from '#shared/types/models'

useHead({ title: 'Calendario' })

const route = useRoute()
const router = useRouter()
const { prefs } = usePreferences()
const { data: activities } = useActivities()

const today = todayKey()
const initial = typeof route.query.m === 'string' && /^\d{4}-\d{2}$/.test(route.query.m) ? route.query.m : today.slice(0, 7)
const month = ref(initial)

const year = computed(() => Number(month.value.slice(0, 4)))
const monthIndex = computed(() => Number(month.value.slice(5, 7)) - 1)
const grid = computed(() => monthGrid(year.value, monthIndex.value, prefs.value.weekStart))
const title = computed(() => {
  const s = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(year.value, monthIndex.value, 1))
  return s.charAt(0).toUpperCase() + s.slice(1)
})

const { data: entries } = useLiveQuery(
  () => useDb().entries.where('date').between(grid.value[0]!, grid.value.at(-1)!, true, true).toArray(),
  [grid],
  [] as Entry[],
)

const weekdays = computed(() => {
  const base = prefs.value.weekStart === 1 ? ['L', 'M', 'M', 'G', 'V', 'S', 'D'] : ['D', 'L', 'M', 'M', 'G', 'V', 'S']
  return base
})

interface DayInfo { ratio: number, notes: number, photos: boolean }
const info = computed(() => {
  const out = new Map<DateKey, DayInfo>()
  const withAct = entries.value.filter(e => e.activityId)
  for (const d of grid.value) {
    const dayEntries = entries.value.filter(e => e.date === d)
    let ratio = -1
    if (d <= today) {
      const p = planDay(activities.value, d, withAct, prefs.value.weekStart)
      if (p.scheduled.length) ratio = p.scheduled.filter(s => s.status !== 'pending').length / p.scheduled.length
    }
    out.set(d, {
      ratio,
      notes: dayEntries.filter(e => !e.activityId).length,
      photos: dayEntries.some(e => e.photoIds.length > 0),
    })
  }
  return out
})

function shift(n: number) {
  const d = new Date(year.value, monthIndex.value + n, 1)
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  router.replace({ query: month.value === today.slice(0, 7) ? {} : { m: month.value } })
}

function goToday() {
  month.value = today.slice(0, 7)
  router.replace({ query: {} })
}

let x0 = 0
let y0 = 0
function ts(e: TouchEvent) {
  x0 = e.touches[0]!.clientX
  y0 = e.touches[0]!.clientY
}
function te(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - x0
  const dy = e.changedTouches[0]!.clientY - y0
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) shift(dx < 0 ? 1 : -1)
}

const R = 18
const C = 2 * Math.PI * R

const monthNotes = computed(() => entries.value.filter(e => !e.activityId && e.date.startsWith(month.value)).length)
const perfectDays = computed(() => [...info.value.entries()].filter(([d, i]) => d.startsWith(month.value) && i.ratio === 1).length)
</script>

<template>
  <div>
    <AppHeader title="Calendario" />
    <main class="px-4 pb-6 pt-4" @touchstart.passive="ts" @touchend.passive="te">
      <div class="mb-3 flex items-center gap-2">
        <h2 class="flex-1 font-serif text-lg font-semibold text-highlighted" aria-live="polite">
          {{ title }}
        </h2>
        <UButton v-if="month !== today.slice(0, 7)" label="Oggi" size="sm" color="neutral" variant="soft" @click="goToday" />
        <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" aria-label="Mese precedente" @click="shift(-1)" />
        <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" aria-label="Mese successivo" @click="shift(1)" />
      </div>

      <div class="grid grid-cols-7 gap-y-1 text-center" role="grid" :aria-label="title">
        <div v-for="(w, i) in weekdays" :key="i" class="pb-1 text-xs font-medium text-muted" role="columnheader">
          {{ w }}
        </div>
        <NuxtLink
          v-for="d in grid"
          :key="d"
          :to="{ path: '/', query: d === today ? {} : { d } }"
          role="gridcell"
          class="flex flex-col items-center gap-0.5 rounded-xl py-1 focus-visible:outline-2 focus-visible:outline-primary"
          :class="d.startsWith(month) ? '' : 'opacity-35'"
          :aria-label="`${formatLongDate(d)}${info.get(d)?.notes ? `, ${info.get(d)!.notes} note` : ''}`"
        >
          <span class="relative flex size-11 items-center justify-center">
            <svg class="absolute inset-0 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
              <circle v-if="(info.get(d)?.ratio ?? -1) >= 0" cx="22" cy="22" :r="R" fill="none" class="stroke-(--ui-border)" stroke-width="3" />
              <circle
                v-if="(info.get(d)?.ratio ?? 0) > 0"
                cx="22"
                cy="22"
                :r="R"
                fill="none"
                class="stroke-(--ui-primary)"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="C"
                :stroke-dashoffset="C * (1 - info.get(d)!.ratio)"
              />
            </svg>
            <span
              class="relative flex size-8 items-center justify-center rounded-full text-sm font-medium tabular-nums"
              :class="d === today ? 'bg-primary text-inverted' : info.get(d)?.ratio === 1 ? 'bg-primary/15 text-primary' : 'text-highlighted'"
            >{{ fromDateKey(d).getDate() }}</span>
          </span>
          <span class="flex h-1.5 items-center gap-0.5" aria-hidden="true">
            <span v-if="info.get(d)?.notes" class="size-1.5 rounded-full bg-primary/70" />
            <span v-if="info.get(d)?.photos" class="size-1.5 rounded-full bg-amber-500/80" />
          </span>
        </NuxtLink>
      </div>

      <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span class="inline-flex items-center gap-1"><span class="size-2.5 rounded-full border-2 border-primary" /> attività completate</span>
        <span class="inline-flex items-center gap-1"><span class="size-1.5 rounded-full bg-primary/70" /> note</span>
        <span class="inline-flex items-center gap-1"><span class="size-1.5 rounded-full bg-amber-500/80" /> foto</span>
      </div>

      <dl class="mt-6 grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-default bg-elevated/40 p-3">
          <dt class="text-xs text-muted">
            Giorni completi
          </dt>
          <dd class="font-serif text-2xl font-semibold text-highlighted">
            {{ perfectDays }}
          </dd>
        </div>
        <div class="rounded-xl border border-default bg-elevated/40 p-3">
          <dt class="text-xs text-muted">
            Note nel mese
          </dt>
          <dd class="font-serif text-2xl font-semibold text-highlighted">
            {{ monthNotes }}
          </dd>
        </div>
      </dl>
    </main>
  </div>
</template>
