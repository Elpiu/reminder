<script setup lang="ts">
import type { DateKey } from '#shared/types/models'

/** Mappa annuale stile "contributi": una colonna per settimana. */
const props = withDefaults(defineProps<{
  to: DateKey
  weeks?: number
  /** Intensità 0..1 per giorno; assente = nessun dato. */
  values: Map<DateKey, number>
  color?: string
  weekStart?: 1 | 7
}>(), { weeks: 26, color: 'var(--ui-primary)', weekStart: 1 })

const columns = computed(() => {
  const lastWeek = startOfWeek(props.to, props.weekStart)
  const first = addDays(lastWeek, -7 * (props.weeks - 1))
  return Array.from({ length: props.weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)))
})

// mostra subito le settimane più recenti
const scroller = useTemplateRef<HTMLElement>('scroller')
onMounted(() => {
  if (scroller.value) scroller.value.scrollLeft = scroller.value.scrollWidth
})

const monthLabels = computed(() => {
  const fmt = new Intl.DateTimeFormat('it-IT', { month: 'short' })
  return columns.value.map((col, i) => {
    const firstOfMonth = col.find(d => d.endsWith('-01'))
    return firstOfMonth || i === 0 ? fmt.format(fromDateKey(firstOfMonth ?? col[0]!)) : ''
  })
})
</script>

<template>
  <div ref="scroller" class="no-scrollbar overflow-x-auto" role="img" :aria-label="`Mappa delle ultime ${weeks} settimane`">
    <div class="inline-flex flex-col gap-1">
      <div class="flex gap-[3px] text-[10px] text-muted" aria-hidden="true">
        <span v-for="(m, i) in monthLabels" :key="i" class="w-3 overflow-visible whitespace-nowrap">{{ m }}</span>
      </div>
      <div class="flex gap-[3px]">
        <div v-for="(col, i) in columns" :key="i" class="flex flex-col gap-[3px]">
          <span
            v-for="d in col"
            :key="d"
            class="size-3 rounded-[3px]"
            :class="d > to ? 'opacity-0' : ''"
            :title="`${formatShortDate(d)}`"
            :style="{
              backgroundColor: values.has(d)
                ? `color-mix(in oklab, ${color} ${Math.round(25 + 75 * values.get(d)!)}%, transparent)`
                : 'var(--ui-bg-accented)',
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
