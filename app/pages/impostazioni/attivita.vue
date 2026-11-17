<script setup lang="ts">
import type { Activity } from '#shared/types/models'
import { LazyActivityEditor } from '#components'

useHead({ title: 'Attività' })

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
  const pack = PRESET_PACKS.find(p => p.id === id)
  if (!pack) return
  const existing = new Set(activities.value.map(a => a.name.toLowerCase()))
  const fresh = pack.activities.filter(a => !existing.has(a.name.toLowerCase()))
  await addPresetActivities(fresh)
  presetsOpen.value = false
  useToast().add({ title: fresh.length ? `Aggiunte ${fresh.length} attività` : 'Le attività del pacchetto ci sono già', icon: 'i-lucide-sparkles' })
}

function menuFor(a: Activity) {
  return [[
    { label: 'Modifica', icon: 'i-lucide-pencil', onSelect: () => editor.open({ activity: a }) },
    { label: 'Statistiche', icon: 'i-lucide-chart-no-axes-column', to: `/andamento/${a.id}` },
    { label: a.archived ? 'Ripristina' : 'Archivia', icon: a.archived ? 'i-lucide-archive-restore' : 'i-lucide-archive', onSelect: () => setArchived(a, !a.archived) },
  ], [
    { label: 'Elimina', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => deleteActivity(a) },
  ]]
}
</script>

<template>
  <div>
    <AppHeader title="Attività" subtitle="Cosa tracci ogni giorno" back="/impostazioni">
      <template #actions>
        <UButton
          v-if="active.length > 1"
          :label="reordering ? 'Fine' : 'Ordina'"
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
        <UButton label="Nuova attività" icon="i-lucide-plus" block size="lg" @click="editor.open({})" />
        <UButton label="Dai pacchetti" icon="i-lucide-sparkles" block size="lg" color="neutral" variant="soft" @click="presetsOpen = true" />
      </div>

      <ul v-if="active.length" class="space-y-2">
        <li v-for="(a, i) in active" :key="a.id" class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 p-3">
          <ActivityIcon :icon="a.icon" :color="a.color" size="sm" />
          <button type="button" class="min-w-0 flex-1 rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary" @click="editor.open({ activity: a })">
            <span class="block truncate font-medium text-highlighted">{{ a.name }}</span>
            <span class="block truncate text-xs text-muted">{{ KIND_INFO[a.kind].label }} · {{ recurrenceLabel(a.recurrence) }}</span>
          </button>
          <template v-if="reordering">
            <UButton icon="i-lucide-chevron-up" color="neutral" variant="ghost" size="sm" :disabled="i === 0" :aria-label="`Sposta su ${a.name}`" @click="move(a, -1)" />
            <UButton icon="i-lucide-chevron-down" color="neutral" variant="ghost" size="sm" :disabled="i === active.length - 1" :aria-label="`Sposta giù ${a.name}`" @click="move(a, 1)" />
          </template>
          <UDropdownMenu v-else :items="menuFor(a)" :content="{ align: 'end' }">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" :aria-label="`Azioni ${a.name}`" />
          </UDropdownMenu>
        </li>
      </ul>
      <UEmpty
        v-else-if="ready"
        icon="i-lucide-list-checks"
        title="Nessuna attività"
        description="Creane una da zero o parti da un pacchetto già pronto."
        variant="naked"
      />

      <section v-if="archived.length" aria-labelledby="arch-title">
        <h2 id="arch-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Archiviate
        </h2>
        <ul class="space-y-2">
          <li v-for="a in archived" :key="a.id" class="flex items-center gap-3 rounded-xl border border-dashed border-default p-3 opacity-80">
            <ActivityIcon :icon="a.icon" :color="a.color" size="sm" />
            <span class="min-w-0 flex-1 truncate text-highlighted">{{ a.name }}</span>
            <UDropdownMenu :items="menuFor(a)" :content="{ align: 'end' }">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" :aria-label="`Azioni ${a.name}`" />
            </UDropdownMenu>
          </li>
        </ul>
      </section>
    </main>

    <UModal v-model:open="presetsOpen" title="Aggiungi da un pacchetto" description="Puoi modificare tutto dopo.">
      <template #body>
        <ul class="space-y-2">
          <li v-for="p in PRESET_PACKS" :key="p.id">
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
