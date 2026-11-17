<script setup lang="ts">
import type { Activity, DateKey, Entry, EntryValue } from '#shared/types/models'

const props = defineProps<{
  activity: Activity
  date: DateKey
  entry?: Entry
}>()
const emit = defineEmits<{ close: [boolean] }>()

const a = props.activity
const initial = props.entry?.value ?? null

const num = ref<number | null>(typeof initial === 'number' ? initial : null)
const hours = ref(typeof initial === 'number' && a.kind === 'duration' ? Math.floor(initial / 60) : 0)
const minutes = ref(typeof initial === 'number' && a.kind === 'duration' ? Math.round(initial % 60) : 0)
const str = ref(typeof initial === 'string' ? initial : '')
const checked = ref(initial === true)
const pickValue = ref<string | number | null>(typeof initial === 'string' || typeof initial === 'number' ? initial : null)
const comment = ref(props.entry?.text ?? '')
const saving = ref(false)
const fmt = useFmt()

const durationPresets = (a.goal?.target ?? 0) >= 240
  ? [360, 390, 420, 450, 480, 540]
  : [15, 30, 45, 60, 90, 120]

const options = computed(() => (a.kind === 'scale'
  ? a.scaleLabels.map((label, i) => ({ label, value: i + 1 as string | number }))
  : a.choices.map(c => ({ label: c, value: c as string | number }))))

function currentValue(): EntryValue {
  switch (a.kind) {
    case 'check': return checked.value ? true : null
    case 'counter':
    case 'number': return num.value === null || Number.isNaN(num.value) ? null : num.value
    case 'duration': {
      const total = (hours.value || 0) * 60 + (minutes.value || 0)
      return total > 0 ? total : null
    }
    case 'scale':
    case 'choice': return pickValue.value
    case 'text': return str.value.trim() ? str.value.trim() : null
  }
}

async function save() {
  saving.value = true
  try {
    await setActivityValue(a, props.date, currentValue(), comment.value.trim())
    emit('close', true)
  }
  finally {
    saving.value = false
  }
}

async function clear() {
  if (props.entry) await deleteEntry(props.entry)
  emit('close', true)
}

function setPreset(m: number) {
  hours.value = Math.floor(m / 60)
  minutes.value = m % 60
}
</script>

<template>
  <UDrawer
    :title="a.name"
    :description="`${fmt.dayTitle(date)}${a.kind === 'number' && a.unit ? ` · ${$t('sheet.inUnit', { unit: a.unit })}` : ''}`"
    :ui="{ container: 'max-w-xl mx-auto w-full', body: 'space-y-5' }"
  >
    <template #body>
      <form id="value-form" class="space-y-5" @submit.prevent="save">
        <USwitch v-if="a.kind === 'check'" v-model="checked" :label="$t('common.done')" size="xl" />

        <UFormField v-else-if="a.kind === 'counter' || a.kind === 'number'" :label="a.kind === 'counter' ? $t('sheet.howMany') : $t('sheet.value')" :hint="a.unit">
          <UInputNumber
            v-model="num"
            :min="a.kind === 'counter' ? 0 : undefined"
            :step="a.kind === 'counter' ? a.step || 1 : 0.1"
            :step-snapping="false"
            size="xl"
            class="w-full"
            autofocus
            :format-options="{ maximumFractionDigits: 2 }"
          />
        </UFormField>

        <div v-else-if="a.kind === 'duration'" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <UFormField :label="$t('sheet.hours')">
              <UInputNumber v-model="hours" :min="0" :max="24" size="xl" class="w-full" />
            </UFormField>
            <UFormField :label="$t('sheet.minutes')">
              <UInputNumber v-model="minutes" :min="0" :max="59" :step="5" :step-snapping="false" size="xl" class="w-full" />
            </UFormField>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="m in durationPresets"
              :key="m"
              :label="formatDuration(m)"
              size="sm"
              color="neutral"
              variant="soft"
              @click="setPreset(m)"
            />
          </div>
        </div>

        <div v-else-if="a.kind === 'scale' || a.kind === 'choice'" class="flex flex-wrap gap-2" role="group" :aria-label="a.name">
          <UButton
            v-for="o in options"
            :key="String(o.value)"
            :label="o.label"
            size="lg"
            :color="pickValue === o.value ? 'primary' : 'neutral'"
            :variant="pickValue === o.value ? 'solid' : 'soft'"
            :class="a.kind === 'scale' ? 'min-w-12 justify-center text-lg' : ''"
            :aria-pressed="pickValue === o.value"
            @click="pickValue = pickValue === o.value ? null : o.value"
          />
        </div>

        <UFormField v-else-if="a.kind === 'text'" :label="a.name">
          <UTextarea v-model="str" autoresize :rows="4" :maxrows="12" class="w-full" autofocus :ui="{ base: 'font-serif' }" />
        </UFormField>

        <UFormField v-if="a.kind !== 'text'" :label="$t('sheet.note')" :hint="$t('common.optional')">
          <UTextarea v-model="comment" autoresize :rows="2" :maxrows="6" class="w-full" :placeholder="$t('sheet.notePlaceholder')" />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton
          v-if="entry"
          :label="$t('sheet.clear')"
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          @click="clear"
        />
        <UButton
          type="submit"
          form="value-form"
          :label="$t('common.save')"
          icon="i-lucide-check"
          size="lg"
          block
          class="flex-1"
          :loading="saving"
        />
      </div>
    </template>
  </UDrawer>
</template>
