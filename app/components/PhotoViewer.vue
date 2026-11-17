<script setup lang="ts">
const props = defineProps<{ ids: string[], start?: number }>()
defineEmits<{ close: [] }>()
const index = ref(props.start ?? 0)
</script>

<template>
  <UModal fullscreen :ui="{ content: 'bg-black/95', body: 'p-0 sm:p-0 flex items-center justify-center' }" :title="$t('photos.title')" :close="{ color: 'neutral', variant: 'solid' }">
    <template #body>
      <div class="relative flex size-full items-center justify-center">
        <PhotoThumb :id="ids[index]!" kind="full" class="max-h-full max-w-full !object-contain" :alt="$t('photos.position', { n: index + 1, total: ids.length })" />
        <template v-if="ids.length > 1">
          <UButton class="absolute left-2" icon="i-lucide-chevron-left" color="neutral" variant="solid" :aria-label="$t('photos.prev')" @click="index = (index - 1 + ids.length) % ids.length" />
          <UButton class="absolute right-2" icon="i-lucide-chevron-right" color="neutral" variant="solid" :aria-label="$t('photos.next')" @click="index = (index + 1) % ids.length" />
          <span class="absolute bottom-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">{{ index + 1 }} / {{ ids.length }}</span>
        </template>
      </div>
    </template>
  </UModal>
</template>
