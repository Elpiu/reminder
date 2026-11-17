<script setup lang="ts">
import type { Entry } from '#shared/types/models'

const fmt = useFmt()
const { t } = fmt
useHead({ title: () => t('search.title') })

const route = useRoute()
const { data: activities } = useActivities()
const { tags } = useTags()

const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const tagId = ref<string | undefined>(typeof route.query.tag === 'string' ? route.query.tag : undefined)
const activityId = ref<string | undefined>(undefined)
const from = ref('')
const to = ref('')
const showFilters = ref(!!tagId.value)

const { data: all, ready } = useLiveQuery(() => useDb().entries.toArray(), [], [] as Entry[])
const actById = computed(() => new Map(activities.value.map(a => [a.id, a])))

const activityItems = computed(() => [
  { label: t('search.all'), value: undefined },
  { label: t('search.onlyNotes'), value: '__notes' },
  ...activities.value.map(a => ({ label: a.name, value: a.id, icon: a.icon })),
])
const tagItems = computed(() => [{ label: t('search.allTags'), value: undefined }, ...tags.value.map(t => ({ label: `#${t.name}`, value: t.id }))])

const active = computed(() => !!(q.value.trim() || tagId.value || activityId.value || from.value || to.value))
const filterCount = computed(() => [tagId.value, activityId.value, from.value, to.value].filter(Boolean).length)

const normalize = (s: string) => s.toLocaleLowerCase('it').normalize('NFD').replace(/\p{Diacritic}/gu, '')

const results = computed(() => {
  if (!active.value) return []
  const needle = normalize(q.value.trim())
  return all.value.filter((e) => {
    if (from.value && e.date < from.value) return false
    if (to.value && e.date > to.value) return false
    if (tagId.value && !e.tagIds.includes(tagId.value)) return false
    if (activityId.value === '__notes' && e.activityId) return false
    if (activityId.value && activityId.value !== '__notes' && e.activityId !== activityId.value) return false
    if (needle) {
      const a = e.activityId ? actById.value.get(e.activityId) : undefined
      const hay = normalize([e.text, a?.name ?? '', typeof e.value === 'string' ? e.value : ''].join(' '))
      if (!hay.includes(needle)) return false
    }
    return true
  }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
})

const groups = computed(() => {
  const out: { date: string, items: Entry[] }[] = []
  for (const e of results.value.slice(0, 300)) {
    const last = out.at(-1)
    if (last?.date === e.date) last.items.push(e)
    else out.push({ date: e.date, items: [e] })
  }
  return out
})

function reset() {
  q.value = ''
  tagId.value = undefined
  activityId.value = undefined
  from.value = ''
  to.value = ''
}
</script>

<template>
  <div>
    <AppHeader :title="$t('search.title')" back="/">
      <template #actions>
        <span />
      </template>
    </AppHeader>
    <main class="space-y-4 px-4 pb-6 pt-4">
      <div class="flex gap-2">
        <UInput
          v-model="q"
          icon="i-lucide-search"
          :placeholder="$t('search.placeholder')"
          :aria-label="$t('search.aria')"
          size="lg"
          class="flex-1"
          autofocus
          type="search"
        />
        <UChip :text="filterCount" :show="filterCount > 0" size="3xl">
          <UButton
            icon="i-lucide-sliders-horizontal"
            size="lg"
            :color="showFilters ? 'primary' : 'neutral'"
            variant="soft"
            :aria-label="$t('search.filters')"
            :aria-expanded="showFilters"
            @click="showFilters = !showFilters"
          />
        </UChip>
      </div>

      <div v-if="showFilters" class="grid grid-cols-2 gap-3 rounded-xl border border-default bg-elevated/40 p-3">
        <UFormField :label="$t('search.what')" class="col-span-2 sm:col-span-1">
          <USelect v-model="activityId" :items="activityItems" class="w-full" />
        </UFormField>
        <UFormField :label="$t('search.tag')" class="col-span-2 sm:col-span-1">
          <USelect v-model="tagId" :items="tagItems" class="w-full" />
        </UFormField>
        <UFormField :label="$t('search.from')">
          <UInput v-model="from" type="date" class="w-full" />
        </UFormField>
        <UFormField :label="$t('search.to')">
          <UInput v-model="to" type="date" class="w-full" />
        </UFormField>
        <UButton v-if="active" :label="$t('search.reset')" icon="i-lucide-x" color="neutral" variant="ghost" size="sm" class="col-span-2 justify-self-start" @click="reset" />
      </div>

      <p v-if="active && ready" class="text-sm text-muted" aria-live="polite">
        {{ $t('search.results', results.length) }}
      </p>

      <section v-for="g in groups" :key="g.date" :aria-label="fmt.longDate(g.date)" class="space-y-2">
        <h2 class="sticky top-14 z-10 -mx-4 bg-default/90 px-4 py-1 text-sm font-semibold text-muted backdrop-blur">
          <NuxtLink :to="{ path: '/', query: { d: g.date } }" class="hover:text-primary">
            {{ fmt.longDate(g.date) }}
          </NuxtLink>
        </h2>
        <template v-for="e in g.items" :key="e.id">
          <EntryCard v-if="!e.activityId" :entry="e" />
          <NuxtLink
            v-else-if="actById.get(e.activityId)"
            :to="`/andamento/${e.activityId}`"
            class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 p-3 hover:bg-elevated"
          >
            <ActivityIcon :icon="actById.get(e.activityId)!.icon" :color="actById.get(e.activityId)!.color" size="sm" />
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium text-highlighted">{{ actById.get(e.activityId)!.name }}</span>
              <span v-if="e.text" class="block truncate text-xs text-muted">{{ e.text }}</span>
            </span>
            <span class="text-sm text-muted">{{ fmt.value(actById.get(e.activityId)!, e.value) }}</span>
          </NuxtLink>
        </template>
      </section>

      <UEmpty
        v-if="!active"
        icon="i-lucide-search"
        :title="$t('search.emptyTitle')"
        :description="$t('search.emptyDescription')"
        variant="naked"
      />
    </main>
  </div>
</template>
