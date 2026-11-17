<script setup lang="ts">
const props = withDefaults(defineProps<{ id: string, kind?: 'thumb' | 'full', alt?: string }>(), { kind: 'thumb', alt: 'Foto' })
const src = ref<string | null>(null)
watch(() => props.id, async (id) => {
  src.value = await photoUrl(id, props.kind)
}, { immediate: true })
</script>

<template>
  <img v-if="src" :src="src" :alt="alt" loading="lazy" decoding="async" class="size-full object-cover">
  <span v-else class="flex size-full items-center justify-center bg-elevated text-muted">
    <UIcon name="i-lucide-image" class="size-5" />
  </span>
</template>
