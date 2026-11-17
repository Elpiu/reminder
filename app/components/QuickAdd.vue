<script setup lang="ts">
import type { DateKey } from '#shared/types/models'
import { LazyNoteEditor } from '#components'

const props = defineProps<{ date: DateKey }>()
const text = ref('')
const sending = ref(false)
const editor = useOverlay().create(LazyNoteEditor)
const photoInput = useTemplateRef<HTMLInputElement>('photo')
const toast = useToast()

async function send() {
  const t = text.value.trim()
  if (!t) return openEditor()
  sending.value = true
  text.value = ''
  try {
    await createNote({ date: props.date, time: props.date === todayKey() ? nowTime() : '12:00', text: t, tagIds: [], photoIds: [] })
  }
  catch (err) {
    text.value = t
    toast.add({ title: 'Nota non salvata', description: (err as Error).message, color: 'error' })
  }
  finally {
    sending.value = false
  }
}

function openEditor(photos: string[] = []) {
  editor.open({ date: props.date, initialText: text.value, initialPhotos: photos })
  text.value = ''
}

async function onPhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    openEditor([await savePhoto(file)])
  }
  catch (err) {
    toast.add({ title: 'Foto non aggiunta', description: (err as Error).message, color: 'error' })
  }
  finally {
    if (photoInput.value) photoInput.value.value = ''
  }
}
</script>

<template>
  <form
    class="fixed inset-x-0 bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom))] z-30 border-t border-default/60 bg-default/90 backdrop-blur"
    @submit.prevent="send"
  >
    <div class="mx-auto flex max-w-2xl items-center gap-1.5 px-3 py-2">
      <input
        ref="photo"
        type="file"
        accept="image/*"
        class="sr-only"
        tabindex="-1"
        aria-hidden="true"
        @change="onPhoto"
      >
      <UButton icon="i-lucide-camera" color="neutral" variant="ghost" aria-label="Aggiungi una foto" @click="photoInput?.click()" />
      <UInput
        v-model="text"
        placeholder="Scrivi qualcosa…"
        aria-label="Nota veloce"
        class="flex-1"
        size="lg"
        :ui="{ base: 'rounded-full' }"
        enterkeyhint="send"
      />
      <UButton
        v-if="text.trim()"
        type="submit"
        icon="i-lucide-send-horizontal"
        :loading="sending"
        aria-label="Salva nota"
        class="rounded-full"
        size="lg"
      />
      <UButton
        v-else
        icon="i-lucide-maximize-2"
        color="neutral"
        variant="ghost"
        aria-label="Apri editor completo"
        @click="openEditor()"
      />
    </div>
  </form>
</template>
