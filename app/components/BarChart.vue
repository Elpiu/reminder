<script setup lang="ts">
/** Grafico a barre minimale in SVG, colorato con le variabili del tema. */
const props = withDefaults(defineProps<{
  points: { label: string, value: number | null }[]
  color?: string
  goal?: number | null
  format?: (v: number) => string
}>(), { color: 'var(--ui-primary)', goal: null, format: (v: number) => String(v) })

const W = 320
const H = 140
const PAD = 18

const max = computed(() => Math.max(1, props.goal ?? 0, ...props.points.map(p => p.value ?? 0)))
const bw = computed(() => (W - PAD) / Math.max(1, props.points.length))
const y = (v: number) => H - PAD - (v / max.value) * (H - PAD * 2)
const filled = computed(() => props.points.filter(p => p.value !== null))
const avg = computed(() => (filled.value.length ? filled.value.reduce((s, p) => s + p.value!, 0) / filled.value.length : null))
const tickEvery = computed(() => Math.ceil(props.points.length / 6))
</script>

<template>
  <figure>
    <svg :viewBox="`0 0 ${W} ${H}`" class="h-auto w-full" role="img" :aria-label="$t('progress.chartAria', { avg: avg === null ? $t('progress.noData') : format(avg) })">
      <line :x1="PAD" :x2="W" :y1="H - PAD" :y2="H - PAD" stroke="var(--ui-border)" />
      <line
        v-if="goal"
        :x1="PAD"
        :x2="W"
        :y1="y(goal)"
        :y2="y(goal)"
        stroke="var(--ui-text-muted)"
        stroke-dasharray="4 4"
      />
      <text v-if="goal" :x="W" :y="y(goal) - 3" text-anchor="end" class="fill-(--ui-text-muted) text-[9px]">{{ $t('progress.chartGoal') }}</text>
      <g v-for="(p, i) in points" :key="i">
        <rect
          v-if="p.value !== null && p.value > 0"
          :x="PAD + i * bw + bw * 0.15"
          :y="y(p.value)"
          :width="Math.max(1, bw * 0.7)"
          :height="H - PAD - y(p.value)"
          rx="2"
          :fill="color"
        >
          <title>{{ p.label }}: {{ format(p.value) }}</title>
        </rect>
        <text
          v-if="i % tickEvery === 0"
          :x="PAD + i * bw + bw / 2"
          :y="H - 4"
          text-anchor="middle"
          class="fill-(--ui-text-muted) text-[9px]"
        >{{ p.label }}</text>
      </g>
      <text :x="0" :y="PAD - 4" class="fill-(--ui-text-muted) text-[9px]">{{ format(max) }}</text>
    </svg>
    <figcaption v-if="avg !== null" class="mt-1 text-xs text-muted">
      {{ $t('progress.chartAverage') }} <strong class="text-default">{{ format(avg) }}</strong>
    </figcaption>
  </figure>
</template>
