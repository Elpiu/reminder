<script setup lang="ts">
import type { DateKey } from '#shared/types/models'
import { LazyActivityEditor } from '#components'

const route = useRoute()
const router = useRouter()
const { prefs, save: savePrefs } = usePreferences()
const fmt = useFmt()

const date = computed<DateKey>(() => {
  const d = route.query.d
  return typeof d === 'string' && isDateKey(d) ? d : todayKey()
})

const { plan, notes, reminders, weekProgress, weekFrom, ready } = useDay(date)
const activityEditor = useOverlay().create(LazyActivityEditor)

const isToday = computed(() => date.value === todayKey())
const scheduled = computed(() => plan.value.scheduled)
const doneCount = computed(() => scheduled.value.filter(i => i.status !== 'pending').length)
const allDone = computed(() => scheduled.value.length > 0 && doneCount.value === scheduled.value.length)

function select(d: DateKey) {
  router.replace({ query: d === todayKey() ? {} : { d } })
}

useHead({ title: () => fmt.dayTitle(date.value) })
</script>

<template>
  <div>
    <AppHeader :title="fmt.dayTitle(date)" :subtitle="isToday ? fmt.longDate(date) : undefined">
      <template #actions>
        <UButton v-if="!isToday" :label="$t('common.today')" icon="i-lucide-undo-2" color="neutral" variant="soft" size="sm" @click="select(todayKey())" />
        <UButton to="/cerca" icon="i-lucide-search" color="neutral" variant="ghost" :aria-label="$t('common.search')" />
        <UButton to="/impostazioni" icon="i-lucide-settings" color="neutral" variant="ghost" :aria-label="$t('common.settings')" />
      </template>
      <template #bottom>
        <WeekStrip :date="date" :week-from="weekFrom" :progress="weekProgress" @select="select" />
      </template>
    </AppHeader>

    <main class="space-y-6 px-4 pb-24 pt-4">
      <!-- Da fare -->
      <section v-if="scheduled.length" aria-labelledby="todo-title">
        <div class="mb-2 flex items-center justify-between gap-3">
          <h2 id="todo-title" class="text-sm font-semibold uppercase tracking-wide text-muted">
            {{ $t('day.todo') }}
          </h2>
          <span class="text-sm tabular-nums text-muted">{{ doneCount }} / {{ scheduled.length }}</span>
        </div>
        <UProgress :model-value="doneCount" :max="scheduled.length" size="xs" class="mb-3" :aria-label="$t('day.progressAria', { done: doneCount, total: scheduled.length })" />
        <p v-if="allDone" class="mb-3 flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm text-primary">
          <UIcon name="i-lucide-party-popper" class="size-5 shrink-0" />
          {{ isToday ? $t('day.allDoneToday') : $t('day.allDoneDay') }}
        </p>
        <ul class="space-y-2">
          <ActivityRow v-for="item in scheduled" :key="item.activity.id" :item="item" :date="date" />
        </ul>
      </section>

      <!-- Promemoria dall'inbox -->
      <section v-if="reminders.length" aria-labelledby="rem-title">
        <h2 id="rem-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('day.reminders') }}
        </h2>
        <ul class="space-y-2">
          <InboxRow v-for="item in reminders" :key="item.id" :item="item" :complete-on="date" />
        </ul>
      </section>

      <!-- Attività facoltative -->
      <section v-if="plan.optional.length" aria-labelledby="opt-title">
        <UCollapsible :open="prefs.showOptional" @update:open="v => savePrefs({ showOptional: v })">
          <button type="button" class="mb-2 flex w-full items-center justify-between rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary">
            <h2 id="opt-title" class="text-sm font-semibold uppercase tracking-wide text-muted">
              {{ $t('day.optional') }}
            </h2>
            <UIcon :name="prefs.showOptional ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4 text-muted" />
          </button>
          <template #content>
            <ul class="space-y-2">
              <ActivityRow v-for="item in plan.optional" :key="item.activity.id" :item="item" :date="date" />
            </ul>
          </template>
        </UCollapsible>
      </section>

      <!-- Nessuna attività -->
      <UEmpty
        v-if="ready && !scheduled.length && !plan.optional.length"
        icon="i-lucide-list-checks"
        :title="$t('day.noActivitiesTitle')"
        :description="$t('day.noActivitiesDescription')"
        :actions="[{ label: $t('day.newActivity'), icon: 'i-lucide-plus', onClick: () => { activityEditor.open({}) } }]"
        variant="naked"
        size="sm"
      />

      <!-- Diario -->
      <section aria-labelledby="diary-title">
        <h2 id="diary-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('day.diary') }}
        </h2>
        <div v-if="notes.length" class="space-y-2">
          <EntryCard v-for="n in notes" :key="n.id" :entry="n" />
        </div>
        <p v-else class="rounded-xl border border-dashed border-default p-4 text-center text-sm text-muted">
          {{ $t('day.diaryEmpty') }}
        </p>
      </section>
    </main>

    <QuickAdd :date="date" />
  </div>
</template>
