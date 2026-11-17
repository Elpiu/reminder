<script setup lang="ts">
import type { InboxItem } from '#shared/types/models'

const props = defineProps<{ item?: InboxItem, initialDate?: string | null }>()
const emit = defineEmits<{ close: [boolean] }>()

const title = ref(props.item?.title ?? '')
const notes = ref(props.item?.notes ?? '')
const dueDate = ref<string>(props.item?.dueDate ?? props.initialDate ?? '')
const tagIds = ref<string[]>([...(props.item?.tagIds ?? [])])
const today = todayKey()

const quick = [
  { label: 'Nessuna', value: '' },
  { label: 'Oggi', value: today },
  { label: 'Domani', value: addDays(today, 1) },
  { label: 'Tra una settimana', value: addDays(today, 7) },
]

async function save() {
  if (!title.value.trim()) return
  const due = isDateKey(dueDate.value) ? dueDate.value : null
  if (props.item) await updateInboxItem(props.item.id, { title: title.value.trim(), notes: notes.value.trim(), dueDate: due, tagIds: tagIds.value })
  else await createInboxItem(title.value, due, tagIds.value)
  emit('close', true)
}
</script>

<template>
  <UDrawer :title="item ? 'Modifica' : 'Nuova cosa da fare'" :ui="{ container: 'max-w-xl mx-auto w-full' }">
    <template #body>
      <form id="inbox-form" class="space-y-4" @submit.prevent="save">
        <UFormField label="Cosa">
          <UInput v-model="title" size="lg" class="w-full" autofocus placeholder="Es. chiamare l'idraulico" />
        </UFormField>
        <UFormField label="Dettagli" hint="facoltativi">
          <UTextarea v-model="notes" autoresize :rows="2" class="w-full" />
        </UFormField>
        <UFormField label="Quando" help="Con una data compare anche nella vista di quel giorno.">
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="q in quick"
              :key="q.label"
              :label="q.label"
              size="sm"
              :color="dueDate === q.value ? 'primary' : 'neutral'"
              :variant="dueDate === q.value ? 'solid' : 'soft'"
              @click="dueDate = q.value"
            />
            <UInput v-model="dueDate" type="date" size="sm" aria-label="Scegli una data" class="w-40" />
          </div>
        </UFormField>
        <UFormField label="Tag">
          <TagPicker v-model="tagIds" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <UButton type="submit" form="inbox-form" label="Salva" icon="i-lucide-check" size="lg" block :disabled="!title.trim()" />
    </template>
  </UDrawer>
</template>
