<script setup lang="ts">
import type { Activity } from '#shared/types/models'
import { LazyActivityEditor } from '#components'

const fmt = useFmt()
const { t } = fmt
const { packs } = usePresets()
useHead({ title: () => t('activities.title') })

const { data: activities, ready } = useActivities()
const editor = useOverlay().create(LazyActivityEditor)
const reordering = ref(false)

const active = computed(() => activities.value.filter(a => !a.archived))
const archived = computed(() => activities.value.filter(a => a.archived))

async function move(a: Activity, dir: -1 | 1) {
  const ids = active.value.map(x => x.id)
  const i = ids.indexOf(a.id)
  const j = i + dir
  if (j < 0 || j >= ids.length) return
  ;[ids[i], ids[j]] = [ids[j]!, ids[i]!]
  await reorderActivities([...ids, ...archived.value.map(x => x.id)])
}

const presetsOpen = ref(false)
async function addPack(id: string) {
  const pack = packs.value.find(p => p.id === id)
  if (!pack) return
  const existing = new Set(activities.value.map(a => a.name.toLowerCase()))
  const fresh = pack.activities.filter(a => !existing.has(a.name.toLowerCase()))
  await addPresetActivities(fresh)
  presetsOpen.value = false
  useToast().add({ title: fresh.length ? t('activities.added', fresh.length) : t('activities.alreadyThere'), icon: 'i-lucide-sparkles' })
}

function menuFor(a: Activity) {
  return [[
    { label: t('common.edit'), icon: 'i-lucide-pencil', onSelect: () => editor.open({ activity: a }) },
    { label: t('activities.stats'), icon: 'i-lucide-chart-no-axes-column', to: `/andamento/${a.id}` },
    { label: a.archived ? t('activities.restore') : t('activities.archive'), icon: a.archived ? 'i-lucide-archive-restore' : 'i-lucide-archive', onSelect: () => setArchived(a, !a.archived) },
  ], [
    { label: t('common.delete'), icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => deleteActivity(a) },
  ]]
}
</script>

<template>
  <div>
    <AppHeader :title="$t('activities.title')" :subtitle="$t('activities.subtitle')" back="/impostazioni">
      <template #actions>
        <UButton
          v-if="active.length > 1"
          :label="reordering ? $t('activities.finish') : $t('activities.reorder')"
          :icon="reordering ? 'i-lucide-check' : 'i-lucide-arrow-up-down'"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="reordering = !reordering"
        />
      </template>
    </AppHeader>
    <main class="space-y-6 px-4 pb-8 pt-4">
      <div class="grid grid-cols-2 gap-2">
        <UButton :label="$t('activities.new')" icon="i-lucide-plus" block size="lg" @click="editor.open({})" />
        <UButton :label="$t('activities.fromPacks')" icon="i-lucide-sparkles" block size="lg" color="neutral" variant="soft" @click="presetsOpen = true" />
      </div>

      <ul v-if="active.length" class="space-y-2">
        <li v-for="(a, i) in active" :key="a.id" class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 p-3">
          <ActivityIcon :icon="a.icon" :color="a.color" size="sm" />
          <button type="button" class="min-w-0 flex-1 rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary" @click="editor.open({ activity: a })">
            <span class="block truncate font-medium text-highlighted">{{ a.name }}</span>
            <span class="block truncate text-xs text-muted">{{ fmt.kindLabel(a.kind) }} · {{ fmt.recurrence(a.recurrence) }}</span>
          </button>
          <template v-if="reordering">
            <UButton icon="i-lucide-chevron-up" color="neutral" variant="ghost" size="sm" :disabled="i === 0" :aria-label="$t('activities.moveUp', { name: a.name })" @click="move(a, -1)" />
            <UButton icon="i-lucide-chevron-down" color="neutral" variant="ghost" size="sm" :disabled="i === active.length - 1" :aria-label="$t('activities.moveDown', { name: a.name })" @click="move(a, 1)" />
          </template>
          <UDropdownMenu v-else :items="menuFor(a)" :content="{ align: 'end' }">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" :aria-label="$t('activities.actionsAria', { name: a.name })" />
          </UDropdownMenu>
        </li>
      </ul>
      <UEmpty
        v-else-if="ready"
        icon="i-lucide-list-checks"
        :title="$t('activities.emptyTitle')"
        :description="$t('activities.emptyDescription')"
        variant="naked"
      />

      <section v-if="archived.length" aria-labelledby="arch-title">
        <h2 id="arch-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('activities.archived') }}
        </h2>
        <ul class="space-y-2">
          <li v-for="a in archived" :key="a.id" class="flex items-center gap-3 rounded-xl border border-dashed border-default p-3 opacity-80">
            <ActivityIcon :icon="a.icon" :color="a.color" size="sm" />
            <span class="min-w-0 flex-1 truncate text-highlighted">{{ a.name }}</span>
            <UDropdownMenu :items="menuFor(a)" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" :aria-label="$t('activities.actionsAria', { name: a.name })" />
            </UDropdownMenu>
          </li>
        </ul>
      </section>
    </main>

    <UModal v-model:open="presetsOpen" :title="$t('activities.packsTitle')" :description="$t('activities.packsDescription')">
      <template #body>
        <ul class="space-y-2">
          <li v-for="p in packs" :key="p.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl border border-default p-3 text-left hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
              @click="addPack(p.id)"
            >
              <UIcon :name="p.icon" class="size-6 text-primary" />
              <span class="flex-1">
                <span class="block font-medium text-highlighted">{{ p.name }}</span>
                <span class="block text-xs text-muted">{{ p.activities.map(a => a.name).join(', ') }}</span>
              </span>
              <UIcon name="i-lucide-plus" class="size-5 text-muted" />
            </button>
          </li>
        </ul>
      </template>
    </UModal>
  </div>
</template>
