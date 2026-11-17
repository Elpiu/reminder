<script setup lang="ts">
import type { Entry, Tag } from '#shared/types/models'
import { LazyConfirmModal } from '#components'

const { t: tr } = useI18n()
useHead({ title: () => tr('tags.title') })

const { tags, ready } = useTags()
const confirm = useOverlay().create(LazyConfirmModal)
const name = ref('')
const editing = ref<string | null>(null)
const editName = ref('')

const { data: entries } = useLiveQuery(() => useDb().entries.toArray(), [], [] as Entry[])
const usage = computed(() => {
  const m = new Map<string, number>()
  for (const e of entries.value) for (const t of e.tagIds) m.set(t, (m.get(t) ?? 0) + 1)
  return m
})

async function add() {
  if (!name.value.trim()) return
  await ensureTag(name.value)
  name.value = ''
}

function startEdit(t: Tag) {
  editing.value = t.id
  editName.value = t.name
}

async function saveEdit(t: Tag) {
  if (editName.value.trim()) await renameTag(t.id, editName.value)
  editing.value = null
}

async function remove(t: Tag) {
  const n = usage.value.get(t.id) ?? 0
  if (n > 0) {
    const ok = await confirm.open({
      title: tr('tags.deleteTitle', { name: t.name }),
      description: tr('tags.deleteDescription', { n }, n),
      confirmLabel: tr('tags.deleteAction'),
      danger: true,
    })
    if (!ok) return
  }
  await deleteTag(t)
}
</script>

<template>
  <div>
    <AppHeader :title="$t('tags.title')" :subtitle="$t('tags.subtitle')" back="/impostazioni">
      <template #actions>
        <span />
      </template>
    </AppHeader>
    <main class="space-y-4 px-4 pb-8 pt-4">
      <form class="flex gap-2" @submit.prevent="add">
        <UInput v-model="name" icon="i-lucide-hash" :placeholder="$t('tags.new')" :aria-label="$t('tags.new')" size="lg" class="flex-1" />
        <UButton type="submit" :label="$t('common.add')" size="lg" :disabled="!name.trim()" />
      </form>

      <ul v-if="tags.length" class="divide-y divide-default overflow-hidden rounded-xl border border-default">
        <li v-for="t in tags" :key="t.id" class="flex items-center gap-2 p-2 pl-3">
          <form v-if="editing === t.id" class="flex flex-1 gap-2" @submit.prevent="saveEdit(t)">
            <UInput v-model="editName" autofocus class="flex-1" :aria-label="$t('tags.name')" @keydown.esc="editing = null" />
            <UButton type="submit" icon="i-lucide-check" :aria-label="$t('common.save')" />
          </form>
          <template v-else>
            <NuxtLink :to="{ path: '/cerca', query: { tag: t.id } }" class="min-w-0 flex-1 truncate font-medium text-highlighted hover:text-primary">
              #{{ t.name }}
            </NuxtLink>
            <span class="text-sm tabular-nums text-muted">{{ usage.get(t.id) ?? 0 }}</span>
            <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="sm" :aria-label="$t('tags.rename', { name: t.name })" @click="startEdit(t)" />
            <UButton icon="i-lucide-trash-2" color="neutral" variant="ghost" size="sm" :aria-label="$t('tags.delete', { name: t.name })" @click="remove(t)" />
          </template>
        </li>
      </ul>
      <UEmpty
        v-else-if="ready"
        icon="i-lucide-tags"
        :title="$t('tags.emptyTitle')"
        :description="$t('tags.emptyDescription')"
        variant="naked"
      />
    </main>
  </div>
</template>
