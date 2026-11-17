<script setup lang="ts">
/** Elenco foto modificabile: aggiunge (fotocamera o galleria) e rimuove. */
const model = defineModel<string[]>({ required: true })
const busy = ref(false)
const input = useTemplateRef<HTMLInputElement>('input')
const toast = useToast()
const fmt = useFmt()

async function onFiles(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  busy.value = true
  try {
    const ids: string[] = []
    for (const f of files) ids.push(await savePhoto(f))
    model.value = [...model.value, ...ids]
  }
  catch (err) {
    toast.add({ title: fmt.t('photos.failed'), description: fmt.error(err), color: 'error', icon: 'i-lucide-image-off' })
  }
  finally {
    busy.value = false
    if (input.value) input.value.value = ''
  }
}

function remove(id: string) {
  model.value = model.value.filter(p => p !== id)
}
</script>

<template>
  <div>
    <input
      ref="input"
      type="file"
      accept="image/*"
      multiple
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
      @change="onFiles"
    >
    <ul class="flex flex-wrap gap-2">
      <li v-for="p in model" :key="p" class="relative size-20 overflow-hidden rounded-lg border border-default">
        <PhotoThumb :id="p" />
        <UButton
          class="absolute right-1 top-1"
          icon="i-lucide-x"
          size="xs"
          color="neutral"
          variant="solid"
          :aria-label="$t('photos.remove')"
          @click="remove(p)"
        />
      </li>
      <li>
        <button
          type="button"
          class="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-accented text-xs text-muted hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
          :disabled="busy"
          @click="input?.click()"
        >
          <UIcon :name="busy ? 'i-lucide-loader-circle' : 'i-lucide-camera'" class="size-5" :class="busy ? 'animate-spin' : ''" />
          {{ $t('photos.add') }}
        </button>
      </li>
    </ul>
  </div>
</template>
