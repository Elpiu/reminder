<script setup lang="ts">
import type { DateKey } from '#shared/types/models'
import type { DayItem } from '#shared/utils/recurrence'
import { LazyValueSheet } from '#components'

const props = defineProps<{
  item: DayItem
  date: DateKey
}>()

const overlay = useOverlay()
const sheet = overlay.create(LazyValueSheet)

const a = computed(() => props.item.activity)
const value = computed(() => props.item.entry?.value ?? null)
const done = computed(() => props.item.status === 'done')
const progress = computed(() => progressOf(a.value, props.item.entry))
const pressed = ref(false)
const fmt = useFmt()
const { t } = fmt

const summary = computed(() => fmt.value(a.value, value.value))

const subtitle = computed(() => {
  const parts: string[] = []
  if (props.item.status === 'weekDone') parts.push(t('row.weekDone'))
  else if (a.value.recurrence.type === 'weekly') parts.push(t('row.weekCount', { n: props.item.weekCount ?? 0, total: a.value.recurrence.times }))
  if (a.value.goal && ['counter', 'number', 'duration'].includes(a.value.kind)) {
    parts.push(t('row.goal', { op: a.value.goal.op === 'gte' ? '≥' : '≤', value: fmt.value(a.value, a.value.goal.target) }))
  }
  if (a.value.time) parts.push(a.value.time)
  return parts.join(' · ')
})

const choiceItems = computed(() => (a.value.kind === 'scale' ? a.value.scaleLabels.map((label, i) => ({ label, value: i + 1 })) : a.value.choices.map(c => ({ label: c, value: c }))))

function bump() {
  pressed.value = true
  setTimeout(() => (pressed.value = false), 180)
  if (navigator.vibrate) navigator.vibrate(10)
}

async function toggleCheck() {
  bump()
  await setActivityValue(a.value, props.date, value.value === true ? null : true)
}

async function increment(delta: number) {
  bump()
  await incrementCounter(a.value, props.date, delta * (a.value.step || 1))
}

async function pick(v: string | number) {
  bump()
  await setActivityValue(a.value, props.date, value.value === v ? null : v)
}

function openSheet() {
  sheet.open({ activity: a.value, date: props.date, entry: props.item.entry })
}
</script>

<template>
  <li
    class="rounded-xl border border-default bg-elevated/40 p-3 transition-colors"
    :class="[done ? 'border-transparent' : '', item.status === 'weekDone' ? 'opacity-70' : '']"
    :style="{ '--act': activityColor(a.color) }"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :class="pressed ? 'scale-90' : ''"
        :aria-label="a.kind === 'check' ? (done ? $t('row.markUndone', { name: a.name }) : $t('row.markDone', { name: a.name })) : $t('row.record', { name: a.name })"
        :aria-pressed="a.kind === 'check' ? done : undefined"
        @click="a.kind === 'check' ? toggleCheck() : a.kind === 'counter' ? increment(1) : openSheet()"
      >
        <ActivityIcon :icon="a.icon" :color="a.color" :progress="progress" :done="done" />
      </button>

      <button
        type="button"
        class="min-w-0 flex-1 rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary"
        @click="openSheet"
      >
        <span class="block truncate font-medium text-highlighted" :class="done ? 'line-through decoration-1 decoration-(--act)/60' : ''">{{ a.name }}</span>
        <span v-if="subtitle || item.entry?.text" class="block truncate text-xs text-muted">
          {{ item.entry?.text || subtitle }}
        </span>
      </button>

      <!-- controlli rapidi -->
      <template v-if="a.kind === 'check'">
        <UButton
          :icon="done ? 'i-lucide-check' : 'i-lucide-circle'"
          :color="done ? 'primary' : 'neutral'"
          :variant="done ? 'soft' : 'ghost'"
          size="lg"
          square
          :aria-label="done ? $t('common.done') : $t('row.todo')"
          @click="toggleCheck"
        />
      </template>
      <div v-else-if="a.kind === 'counter'" class="flex items-center gap-1">
        <UButton
          v-if="typeof value === 'number' && value > 0"
          icon="i-lucide-minus"
          color="neutral"
          variant="ghost"
          square
          :aria-label="$t('row.removeFrom', { name: a.name })"
          @click="increment(-1)"
        />
        <span class="min-w-8 text-center text-sm font-semibold tabular-nums text-highlighted" aria-live="polite">
          {{ typeof value === 'number' ? value : 0 }}<span v-if="a.goal" class="font-normal text-muted">/{{ a.goal.target }}</span>
        </span>
        <UButton icon="i-lucide-plus" color="primary" variant="soft" size="lg" square :aria-label="$t('row.addTo', { name: a.name })" @click="increment(1)" />
      </div>
      <UButton
        v-else-if="a.kind === 'number' || a.kind === 'duration' || a.kind === 'text'"
        :label="summary || (a.kind === 'text' ? $t('row.write') : $t('common.add'))"
        :icon="summary ? undefined : a.kind === 'text' ? 'i-lucide-pen-line' : 'i-lucide-plus'"
        :color="summary ? 'primary' : 'neutral'"
        :variant="summary ? 'soft' : 'outline'"
        class="max-w-36"
        :ui="{ label: 'truncate' }"
        @click="openSheet"
      />
    </div>

    <!-- scala e scelta: direttamente nella riga -->
    <div v-if="(a.kind === 'scale' || a.kind === 'choice') && choiceItems.length" class="mt-2 flex flex-wrap gap-1.5 pl-14" role="group" :aria-label="a.name">
      <UButton
        v-for="c in choiceItems"
        :key="String(c.value)"
        :label="c.label"
        size="sm"
        :color="value === c.value ? 'primary' : 'neutral'"
        :variant="value === c.value ? 'solid' : 'soft'"
        :class="a.kind === 'scale' && [...c.label].length <= 2 ? 'min-w-10 justify-center text-base' : ''"
        :aria-pressed="value === c.value"
        @click="pick(c.value)"
      />
    </div>
  </li>
</template>
