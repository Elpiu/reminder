<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  danger?: boolean
}>(), { description: undefined, confirmLabel: 'Conferma', danger: false })
const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <UModal :title="title" :description="description" :ui="{ content: 'sm:max-w-md' }" :close="false">
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton label="Annulla" color="neutral" variant="ghost" @click="emit('close', false)" />
        <UButton :label="confirmLabel" :color="danger ? 'error' : 'primary'" @click="emit('close', true)" />
      </div>
    </template>
  </UModal>
</template>
