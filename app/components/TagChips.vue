<script setup lang="ts">
const props = defineProps<{ ids: string[] }>()
const { byId } = useTags()
const names = computed(() => props.ids.map(id => byId.value.get(id)?.name).filter((n): n is string => !!n))
</script>

<template>
  <ul v-if="names.length" class="flex flex-wrap gap-1" aria-label="Tag">
    <li v-for="n in names" :key="n">
      <NuxtLink
        :to="{ path: '/cerca', query: { tag: ids[names.indexOf(n)] } }"
        class="inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-xs text-muted hover:text-default"
      >#{{ n }}</NuxtLink>
    </li>
  </ul>
</template>
