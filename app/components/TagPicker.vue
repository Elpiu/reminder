<script setup lang="ts">
const model = defineModel<string[]>({ required: true })
const { tags } = useTags()

const items = computed(() => tags.value.map(t => ({ label: `#${t.name}`, value: t.id })))

async function onCreate(name: string) {
  const tag = await ensureTag(name)
  if (!model.value.includes(tag.id)) model.value = [...model.value, tag.id]
}
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="items"
    value-key="value"
    multiple
    create-item
    icon="i-lucide-tag"
    placeholder="Aggiungi tag"
    :search-input="{ placeholder: 'Cerca o crea un tag…' }"
    class="w-full"
    @create="onCreate"
  />
</template>
