<script setup lang="ts">
import type { DateKey, InboxItem } from '#shared/types/models'
import { LazyInboxEditor } from '#components'

const props = defineProps<{
  item: InboxItem
  /** Giorno in cui finisce la voce quando viene completato. */
  completeOn?: DateKey
}>()

const editor = useOverlay().create(LazyInboxEditor)
const today = todayKey()
const fmt = useFmt()
const overdue = computed(() => !!props.item.dueDate && props.item.dueDate < today)

const menu = computed(() => [
  [
    { label: fmt.t('common.edit'), icon: 'i-lucide-pencil', onSelect: () => editor.open({ item: props.item }) },
    { label: fmt.t('inbox.forToday'), icon: 'i-lucide-sun', onSelect: () => updateInboxItem(props.item.id, { dueDate: today }) },
    { label: fmt.t('inbox.forTomorrow'), icon: 'i-lucide-sunrise', onSelect: () => updateInboxItem(props.item.id, { dueDate: addDays(today, 1) }) },
    ...(props.item.dueDate ? [{ label: fmt.t('inbox.removeDate'), icon: 'i-lucide-calendar-x', onSelect: () => updateInboxItem(props.item.id, { dueDate: null }) }] : []),
  ],
  [{ label: fmt.t('common.delete'), icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => deleteInboxItem(props.item) }],
])

// swipe: destra = fatto, sinistra = elimina
const dx = ref(0)
let x0 = 0
let y0 = 0
let tracking = false
function start(e: TouchEvent) {
  x0 = e.touches[0]!.clientX
  y0 = e.touches[0]!.clientY
  tracking = true
}
function move(e: TouchEvent) {
  if (!tracking) return
  const mx = e.touches[0]!.clientX - x0
  const my = e.touches[0]!.clientY - y0
  if (Math.abs(my) > Math.abs(mx) && Math.abs(dx.value) < 10) {
    tracking = false
    dx.value = 0
    return
  }
  dx.value = mx
}
function end() {
  tracking = false
  const v = dx.value
  dx.value = 0
  if (v > 90) void completeInboxItem(props.item, props.completeOn)
  else if (v < -90) void deleteInboxItem(props.item)
}
</script>

<template>
  <li class="relative overflow-hidden rounded-xl">
    <div class="absolute inset-0 flex items-center justify-between px-4 text-sm font-medium" aria-hidden="true">
      <span class="flex items-center gap-1 text-success" :class="dx > 30 ? 'opacity-100' : 'opacity-0'"><UIcon name="i-lucide-check" class="size-5" /> {{ $t('common.done') }}</span>
      <span class="flex items-center gap-1 text-error" :class="dx < -30 ? 'opacity-100' : 'opacity-0'">{{ $t('common.delete') }} <UIcon name="i-lucide-trash-2" class="size-5" /></span>
    </div>
    <div
      class="relative flex items-center gap-3 rounded-xl border border-default bg-default p-3"
      :class="dx === 0 ? 'transition-transform' : ''"
      :style="{ transform: `translateX(${dx}px)` }"
      @touchstart.passive="start"
      @touchmove.passive="move"
      @touchend="end"
      @touchcancel="end"
    >
      <div class="absolute inset-0 rounded-xl bg-elevated/40" aria-hidden="true" />
      <UButton
        icon="i-lucide-circle"
        color="neutral"
        variant="ghost"
        size="lg"
        square
        class="relative -m-1 hover:text-primary"
        :aria-label="$t('inbox.complete', { title: item.title })"
        @click="completeInboxItem(item, completeOn)"
      />
      <button type="button" class="relative min-w-0 flex-1 rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary" @click="editor.open({ item })">
        <span class="block truncate font-medium text-highlighted">{{ item.title }}</span>
        <span v-if="item.notes" class="block truncate text-xs text-muted">{{ item.notes }}</span>
        <span v-if="item.dueDate" class="mt-0.5 inline-flex items-center gap-1 text-xs" :class="overdue ? 'text-error' : 'text-muted'">
          <UIcon name="i-lucide-calendar" class="size-3" />
          {{ overdue ? `${$t('inbox.overdue')} · ` : '' }}{{ fmt.dayTitle(item.dueDate) }}
        </span>
        <TagChips :ids="item.tagIds" class="mt-1" />
      </button>
      <UDropdownMenu :items="menu" :content="{ align: 'end' }">
        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" class="relative" :aria-label="$t('inbox.actionsAria')" />
      </UDropdownMenu>
    </div>
  </li>
</template>
