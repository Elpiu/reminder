<script setup lang="ts">
import type { DateKey, Entry } from '#shared/types/models'

const props = defineProps<{
  entry?: Entry
  date: DateKey
  initialText?: string
  initialPhotos?: string[]
}>()
const emit = defineEmits<{ close: [boolean] }>()

const text = ref(props.entry?.text ?? props.initialText ?? '')
const day = ref(props.entry?.date ?? props.date)
const time = ref(props.entry?.time ?? (props.date === todayKey() ? nowTime() : '12:00'))
const tagIds = ref<string[]>([...(props.entry?.tagIds ?? [])])
const photoIds = ref<string[]>([...(props.entry?.photoIds ?? props.initialPhotos ?? [])])
const saving = ref(false)
const showMore = ref(!!props.entry && props.entry.tagIds.length > 0)

const canSave = computed(() => text.value.trim().length > 0 || photoIds.value.length > 0)

async function save() {
  if (!canSave.value) return
  saving.value = true
  try {
    const d = isDateKey(day.value) ? day.value : props.date
    if (props.entry) {
      await updateEntry(props.entry.id, { text: text.value.trim(), date: d, time: time.value, tagIds: tagIds.value, photoIds: photoIds.value })
    }
    else {
      await createNote({ date: d, time: time.value, text: text.value, tagIds: tagIds.value, photoIds: photoIds.value })
    }
    emit('close', true)
  }
  finally {
    saving.value = false
  }
}

async function remove() {
  if (props.entry) await deleteEntry(props.entry)
  emit('close', true)
}
</script>

<template>
  <UDrawer
    :title="entry ? 'Modifica nota' : 'Nuova nota'"
    :description="formatDayTitle(isDateKey(day) ? day : date)"
    :ui="{ container: 'max-w-xl mx-auto w-full' }"
  >
    <template #body>
      <form id="note-form" class="space-y-4" @submit.prevent="save">
        <UTextarea
          v-model="text"
          autoresize
          :rows="5"
          :maxrows="16"
          autofocus
          placeholder="Cosa vuoi ricordare?"
          aria-label="Testo della nota"
          class="w-full"
          :ui="{ base: 'font-serif text-base leading-relaxed' }"
          @keydown.ctrl.enter="save"
          @keydown.meta.enter="save"
        />
        <PhotoPicker v-model="photoIds" />
        <UCollapsible v-model:open="showMore">
          <UButton
            :label="showMore ? 'Meno opzioni' : 'Data, ora e tag'"
            :trailing-icon="showMore ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            color="neutral"
            variant="ghost"
            size="sm"
          />
          <template #content>
            <div class="grid grid-cols-2 gap-3 pt-3">
              <UFormField label="Giorno">
                <UInput v-model="day" type="date" class="w-full" />
              </UFormField>
              <UFormField label="Ora">
                <UInput v-model="time" type="time" class="w-full" />
              </UFormField>
              <UFormField label="Tag" class="col-span-2">
                <TagPicker v-model="tagIds" />
              </UFormField>
            </div>
          </template>
        </UCollapsible>
      </form>
    </template>
    <template #footer>
      <div class="flex gap-2">
        <UButton v-if="entry" icon="i-lucide-trash-2" color="error" variant="ghost" aria-label="Elimina nota" @click="remove" />
        <UButton
          type="submit"
          form="note-form"
          label="Salva"
          icon="i-lucide-check"
          size="lg"
          block
          class="flex-1"
          :disabled="!canSave"
          :loading="saving"
        />
      </div>
    </template>
  </UDrawer>
</template>
