<script setup lang="ts">
import type { Activity, ActivityColor, Recurrence, ValueKind } from '#shared/types/models'

const props = defineProps<{ activity?: Activity }>()
const emit = defineEmits<{ close: [boolean] }>()

const draft = reactive<ActivityDraft>(props.activity
  ? JSON.parse(JSON.stringify({
      name: props.activity.name, icon: props.activity.icon, color: props.activity.color, kind: props.activity.kind,
      unit: props.activity.unit, goal: props.activity.goal, step: props.activity.step, scaleLabels: props.activity.scaleLabels,
      choices: props.activity.choices, recurrence: props.activity.recurrence, startDate: props.activity.startDate,
      time: props.activity.time, tagIds: props.activity.tagIds,
    }))
  : emptyActivityDraft())

const saving = ref(false)
const showIcons = ref(false)

const kinds = (Object.keys(KIND_INFO) as ValueKind[]).map(k => ({ value: k, ...KIND_INFO[k] }))
const colors = Object.keys(ACTIVITY_COLORS) as ActivityColor[]
const hasGoal = computed(() => ['counter', 'number', 'duration'].includes(draft.kind))

// ricorrenza
const recType = ref<Recurrence['type']>(draft.recurrence.type)
const days = ref<number[]>(draft.recurrence.type === 'weekdays' ? [...draft.recurrence.days] : [1, 2, 3, 4, 5])
const every = ref(draft.recurrence.type === 'interval' ? draft.recurrence.every : 2)
const times = ref(draft.recurrence.type === 'weekly' ? draft.recurrence.times : 3)
const monthDay = ref(draft.recurrence.type === 'monthly' ? draft.recurrence.day : fromDateKey(todayKey()).getDate())

const recTypes = [
  { value: 'daily', label: 'Ogni giorno' },
  { value: 'weekdays', label: 'Alcuni giorni della settimana' },
  { value: 'weekly', label: 'Un certo numero di volte a settimana' },
  { value: 'interval', label: 'Ogni N giorni' },
  { value: 'monthly', label: 'Una volta al mese' },
  { value: 'none', label: 'Quando capita (nessuna ricorrenza)' },
]
const weekdayNames = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
const weekdayFull = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica']

const recurrence = computed<Recurrence>(() => {
  switch (recType.value) {
    case 'weekdays': return days.value.length ? { type: 'weekdays', days: [...days.value].sort() } : { type: 'daily' }
    case 'interval': return { type: 'interval', every: Math.max(1, every.value || 1) }
    case 'weekly': return { type: 'weekly', times: Math.min(7, Math.max(1, times.value || 1)) }
    case 'monthly': return { type: 'monthly', day: Math.min(31, Math.max(1, monthDay.value || 1)) }
    case 'none': return { type: 'none' }
    default: return { type: 'daily' }
  }
})

function toggleDay(d: number) {
  days.value = days.value.includes(d) ? days.value.filter(x => x !== d) : [...days.value, d]
}

// obiettivo
const goalOn = ref(!!draft.goal)
const goalOp = ref<'gte' | 'lte'>(draft.goal?.op ?? 'gte')
const goalTarget = ref<number>(draft.goal?.target ?? (draft.kind === 'duration' ? 30 : 1))
const goalHours = computed({
  get: () => Math.floor(goalTarget.value / 60),
  set: (h: number) => { goalTarget.value = (h || 0) * 60 + (goalTarget.value % 60) },
})
const goalMinutes = computed({
  get: () => goalTarget.value % 60,
  set: (m: number) => { goalTarget.value = Math.floor(goalTarget.value / 60) * 60 + (m || 0) },
})

// orario
const timeOn = ref(!!draft.time)
const timeValue = ref(draft.time ?? '08:00')

// opzioni
const choicesText = ref(draft.choices.join('\n'))
const scaleText = ref(draft.scaleLabels.join(' '))

const valid = computed(() => draft.name.trim().length > 0 && (draft.kind !== 'choice' || choicesText.value.trim().length > 0))

async function save() {
  if (!valid.value) return
  saving.value = true
  try {
    const data: ActivityDraft = {
      ...toRaw(draft),
      name: draft.name.trim(),
      unit: draft.unit.trim(),
      recurrence: recurrence.value,
      goal: hasGoal.value && goalOn.value && goalTarget.value > 0 ? { op: goalOp.value, target: goalTarget.value } : null,
      time: timeOn.value && /^\d{2}:\d{2}$/.test(timeValue.value) ? timeValue.value : null,
      choices: choicesText.value.split('\n').map(s => s.trim()).filter(Boolean),
      scaleLabels: draft.kind === 'scale'
        ? (scaleText.value.trim().split(/\s+/).filter(Boolean).length >= 2 ? scaleText.value.trim().split(/\s+/) : [...MOOD_LABELS])
        : draft.scaleLabels,
      step: Math.max(1, draft.step || 1),
      startDate: isDateKey(draft.startDate) ? draft.startDate : todayKey(),
    }
    if (props.activity) await updateActivity(props.activity.id, data)
    else await createActivity(data)
    emit('close', true)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    :title="activity ? 'Modifica attività' : 'Nuova attività'"
    :ui="{ content: 'sm:max-w-lg', body: 'space-y-6' }"
    scrollable
  >
    <template #body>
      <form id="activity-form" class="space-y-6" @submit.prevent="save">
        <!-- nome e aspetto -->
        <div class="flex items-end gap-3">
          <button
            type="button"
            class="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Scegli icona e colore"
            :aria-expanded="showIcons"
            @click="showIcons = !showIcons"
          >
            <ActivityIcon :icon="draft.icon" :color="draft.color" size="lg" />
          </button>
          <UFormField label="Nome" class="flex-1">
            <UInput v-model="draft.name" size="lg" class="w-full" placeholder="Es. Bere acqua" autofocus />
          </UFormField>
        </div>

        <div v-if="showIcons" class="space-y-3 rounded-xl border border-default p-3">
          <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Colore">
            <button
              v-for="c in colors"
              :key="c"
              type="button"
              role="radio"
              :aria-checked="draft.color === c"
              :aria-label="c"
              class="size-8 rounded-full ring-offset-2 ring-offset-(--ui-bg) focus-visible:outline-2 focus-visible:outline-primary"
              :class="draft.color === c ? 'ring-2 ring-(--ui-text-highlighted)' : ''"
              :style="{ backgroundColor: ACTIVITY_COLORS[c] }"
              @click="draft.color = c"
            />
          </div>
          <div class="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto" role="radiogroup" aria-label="Icona">
            <button
              v-for="i in ACTIVITY_ICONS"
              :key="i"
              type="button"
              role="radio"
              :aria-checked="draft.icon === i"
              :aria-label="i.replace('i-lucide-', '')"
              class="flex aspect-square items-center justify-center rounded-lg hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
              :class="draft.icon === i ? 'act-soft act-text' : 'text-muted'"
              :style="{ '--act': ACTIVITY_COLORS[draft.color] }"
              @click="draft.icon = i"
            >
              <UIcon :name="i" class="size-5" />
            </button>
          </div>
        </div>

        <!-- tipo -->
        <fieldset>
          <legend class="mb-2 text-sm font-medium text-highlighted">
            Cosa registri
          </legend>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="k in kinds"
              :key="k.value"
              type="button"
              class="flex items-start gap-2 rounded-xl border p-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary"
              :class="draft.kind === k.value ? 'border-primary bg-primary/10' : 'border-default hover:bg-elevated'"
              :aria-pressed="draft.kind === k.value"
              @click="draft.kind = k.value"
            >
              <UIcon :name="k.icon" class="mt-0.5 size-4 shrink-0" :class="draft.kind === k.value ? 'text-primary' : 'text-muted'" />
              <span>
                <span class="block text-sm font-medium text-highlighted">{{ k.label }}</span>
                <span class="block text-xs text-muted">{{ k.hint }}</span>
              </span>
            </button>
          </div>
        </fieldset>

        <!-- opzioni del tipo -->
        <UFormField v-if="draft.kind === 'number'" label="Unità" hint="facoltativa">
          <UInput v-model="draft.unit" placeholder="km, €, kg, pagine…" class="w-full" />
        </UFormField>
        <div v-if="draft.kind === 'counter'" class="grid grid-cols-2 gap-3">
          <UFormField label="Cosa conti" hint="facoltativo">
            <UInput v-model="draft.unit" placeholder="bicchieri" class="w-full" />
          </UFormField>
          <UFormField label="Incremento">
            <UInputNumber v-model="draft.step" :min="1" class="w-full" />
          </UFormField>
        </div>
        <UFormField v-if="draft.kind === 'choice'" label="Opzioni" help="Una per riga.">
          <UTextarea v-model="choicesText" :rows="4" autoresize class="w-full" placeholder="Corsa&#10;Palestra&#10;Bici" />
        </UFormField>
        <UFormField v-if="draft.kind === 'scale'" label="Livelli" help="Separati da spazio, dal più basso al più alto (emoji o numeri).">
          <UInput v-model="scaleText" class="w-full text-lg" />
        </UFormField>

        <!-- obiettivo -->
        <div v-if="hasGoal" class="space-y-3">
          <USwitch v-model="goalOn" label="Obiettivo giornaliero" />
          <div v-if="goalOn" class="flex flex-wrap items-end gap-3">
            <USelect
              v-model="goalOp"
              :items="[{ label: 'Almeno', value: 'gte' }, { label: 'Al massimo', value: 'lte' }]"
              class="w-36"
              aria-label="Tipo di obiettivo"
            />
            <template v-if="draft.kind === 'duration'">
              <UFormField label="Ore">
                <UInputNumber v-model="goalHours" :min="0" :max="24" class="w-28" />
              </UFormField>
              <UFormField label="Min">
                <UInputNumber v-model="goalMinutes" :min="0" :max="59" :step="5" :step-snapping="false" class="w-28" />
              </UFormField>
            </template>
            <UFormField v-else :label="draft.unit || 'Valore'">
              <UInputNumber v-model="goalTarget" :min="0" :step="draft.kind === 'counter' ? 1 : 0.5" :step-snapping="false" class="w-36" />
            </UFormField>
          </div>
        </div>

        <!-- ricorrenza -->
        <div class="space-y-3">
          <UFormField label="Quando">
            <USelect v-model="recType" :items="recTypes" class="w-full" />
          </UFormField>
          <div v-if="recType === 'weekdays'" class="flex gap-1.5" role="group" aria-label="Giorni">
            <UButton
              v-for="(n, i) in weekdayNames"
              :key="i"
              :label="n"
              :aria-label="weekdayFull[i]"
              :aria-pressed="days.includes(i + 1)"
              :color="days.includes(i + 1) ? 'primary' : 'neutral'"
              :variant="days.includes(i + 1) ? 'solid' : 'soft'"
              class="size-10 justify-center rounded-full"
              @click="toggleDay(i + 1)"
            />
          </div>
          <UFormField v-if="recType === 'weekly'" label="Volte a settimana">
            <UInputNumber v-model="times" :min="1" :max="7" class="w-36" />
          </UFormField>
          <UFormField v-if="recType === 'interval'" label="Ogni quanti giorni" :help="`A partire da ${formatShortDate(draft.startDate)}`">
            <UInputNumber v-model="every" :min="1" :max="365" class="w-36" />
          </UFormField>
          <UFormField v-if="recType === 'monthly'" label="Giorno del mese" help="Nei mesi più corti vale l'ultimo giorno.">
            <UInputNumber v-model="monthDay" :min="1" :max="31" class="w-36" />
          </UFormField>
          <p class="text-xs text-muted">
            {{ recType === 'none' ? 'Comparirà in “Registra anche”, senza contare come da fare.' : recurrenceLabel(recurrence) }}
          </p>
        </div>

        <!-- orario -->
        <div class="flex flex-wrap items-center gap-3">
          <USwitch v-model="timeOn" label="Orario indicativo" description="Ordina le attività nella giornata" />
          <UInput v-if="timeOn" v-model="timeValue" type="time" class="w-32" aria-label="Orario" />
        </div>

        <UFormField label="Inizio" help="Da questo giorno l'attività conta nelle statistiche.">
          <UInput v-model="draft.startDate" type="date" class="w-44" />
        </UFormField>

        <UFormField label="Tag" help="Vengono copiati sulle registrazioni.">
          <TagPicker v-model="draft.tagIds" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex w-full gap-2">
        <UButton label="Annulla" color="neutral" variant="ghost" @click="emit('close', false)" />
        <UButton
          type="submit"
          form="activity-form"
          :label="activity ? 'Salva' : 'Crea attività'"
          icon="i-lucide-check"
          class="ml-auto"
          :disabled="!valid"
          :loading="saving"
        />
      </div>
    </template>
  </UModal>
</template>
