<script setup lang="ts">
import type { DateKey } from '#shared/types/models'

const props = defineProps<{
  date: DateKey
  weekFrom: DateKey
  progress: Record<DateKey, { ratio: number, notes: number }>
}>()
const emit = defineEmits<{ select: [DateKey] }>()

const today = todayKey()
const fmt = useFmt()
const days = computed(() => Array.from({ length: 7 }, (_, i) => {
  const key = addDays(props.weekFrom, i)
  const d = fromDateKey(key)
  return { key, num: d.getDate(), wd: fmt.weekdayNarrow(key), info: props.progress[key] }
}))

// swipe orizzontale = settimana precedente/successiva
let startX = 0
let startY = 0
function onTouchStart(e: TouchEvent) {
  startX = e.touches[0]!.clientX
  startY = e.touches[0]!.clientY
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - startX
  const dy = e.changedTouches[0]!.clientY - startY
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) emit('select', addDays(props.date, dx < 0 ? 7 : -7))
}

const R = 17
const C = 2 * Math.PI * R
</script>

<template>
  <div class="flex items-center gap-1 px-2 pb-2" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
    <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" size="sm" :aria-label="$t('day.prevWeek')" @click="emit('select', addDays(date, -7))" />
    <ol class="grid flex-1 grid-cols-7">
      <li v-for="d in days" :key="d.key" class="flex justify-center">
        <button
          type="button"
          class="group flex w-11 flex-col items-center gap-0.5 rounded-xl py-1 focus-visible:outline-2 focus-visible:outline-primary"
          :aria-label="fmt.longDate(d.key)"
          :aria-current="d.key === date ? 'date' : undefined"
          @click="emit('select', d.key)"
        >
          <span class="text-[11px] font-medium uppercase" :class="d.key === today ? 'text-primary' : 'text-muted'">{{ d.wd }}</span>
          <span class="relative flex size-10 items-center justify-center">
            <svg class="absolute inset-0 -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" :r="R" fill="none" class="stroke-(--ui-border)" stroke-width="2.5" />
              <circle
                v-if="d.info && d.info.ratio > 0"
                cx="20"
                cy="20"
                :r="R"
                fill="none"
                class="stroke-(--ui-primary) transition-[stroke-dashoffset] duration-300"
                stroke-width="2.5"
                stroke-linecap="round"
                :stroke-dasharray="C"
                :stroke-dashoffset="C * (1 - d.info.ratio)"
              />
            </svg>
            <span
              class="relative flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors"
              :class="d.key === date ? 'bg-primary text-inverted' : d.key === today ? 'text-primary' : 'text-highlighted group-hover:bg-elevated'"
            >{{ d.num }}</span>
          </span>
          <span class="h-1 w-1 rounded-full" :class="d.info?.notes ? 'bg-primary/70' : 'bg-transparent'" />
        </button>
      </li>
    </ol>
    <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm" :aria-label="$t('day.nextWeek')" @click="emit('select', addDays(date, 7))" />
  </div>
</template>
