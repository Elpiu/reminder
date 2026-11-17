<script setup lang="ts">
import type { ActivityColor } from '#shared/types/models'

const props = withDefaults(defineProps<{
  icon: string
  color: ActivityColor
  size?: 'sm' | 'md' | 'lg'
  /** 0..1 mostra un anello di avanzamento; undefined nessun anello. */
  progress?: number
  done?: boolean
}>(), { size: 'md', progress: undefined, done: false })

const px = computed(() => ({ sm: 32, md: 44, lg: 56 })[props.size])
const r = computed(() => px.value / 2 - 2)
const circ = computed(() => 2 * Math.PI * r.value)
</script>

<template>
  <span
    class="relative inline-flex shrink-0 items-center justify-center rounded-full transition-colors"
    :class="done ? 'text-white' : 'act-soft act-text'"
    :style="{ '--act': ACTIVITY_COLORS[color], 'width': `${px}px`, 'height': `${px}px`, 'backgroundColor': done ? ACTIVITY_COLORS[color] : undefined }"
  >
    <svg
      v-if="progress !== undefined && !done"
      class="absolute inset-0 -rotate-90"
      :width="px"
      :height="px"
      aria-hidden="true"
    >
      <circle
        :cx="px / 2"
        :cy="px / 2"
        :r="r"
        fill="none"
        stroke="var(--act)"
        stroke-width="3"
        stroke-linecap="round"
        :stroke-dasharray="circ"
        :stroke-dashoffset="circ * (1 - Math.min(1, Math.max(0, progress)))"
        class="transition-[stroke-dashoffset] duration-300"
      />
    </svg>
    <UIcon :name="done ? 'i-lucide-check' : icon" :class="size === 'sm' ? 'size-4' : size === 'md' ? 'size-5' : 'size-6'" />
  </span>
</template>
