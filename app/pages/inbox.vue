<script setup lang="ts">
import { LazyInboxEditor } from '#components'

useHead({ title: 'Inbox' })

const { data: items, ready } = useInbox()
const title = ref('')
const editor = useOverlay().create(LazyInboxEditor)

const dated = computed(() => items.value.filter(i => i.dueDate).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!)))
const undated = computed(() => items.value.filter(i => !i.dueDate))

async function add() {
  const t = title.value.trim()
  if (!t) return
  title.value = ''
  await createInboxItem(t)
}
</script>

<template>
  <div>
    <AppHeader title="Inbox" subtitle="Cose da fare, con o senza data" />
    <main class="space-y-6 px-4 pb-6 pt-4">
      <form class="flex gap-2" @submit.prevent="add">
        <UInput
          v-model="title"
          placeholder="Aggiungi una cosa da fare…"
          aria-label="Nuova cosa da fare"
          size="lg"
          class="flex-1"
          icon="i-lucide-plus"
          enterkeyhint="done"
        />
        <UButton v-if="title.trim()" type="submit" label="Aggiungi" size="lg" />
        <UButton v-else icon="i-lucide-calendar-plus" size="lg" color="neutral" variant="soft" aria-label="Aggiungi con data e dettagli" @click="editor.open({})" />
      </form>

      <p v-if="items.length" class="flex items-center gap-2 text-xs text-muted">
        <UIcon name="i-lucide-hand" class="size-4" />
        Scorri a destra per completare, a sinistra per eliminare.
      </p>

      <section v-if="dated.length" aria-labelledby="dated-title">
        <h2 id="dated-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          In programma
        </h2>
        <ul class="space-y-2">
          <InboxRow v-for="item in dated" :key="item.id" :item="item" />
        </ul>
      </section>

      <section v-if="undated.length" aria-labelledby="undated-title">
        <h2 id="undated-title" class="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Senza data
        </h2>
        <ul class="space-y-2">
          <InboxRow v-for="item in undated" :key="item.id" :item="item" />
        </ul>
      </section>

      <UEmpty
        v-if="ready && !items.length"
        icon="i-lucide-inbox"
        title="Inbox vuota"
        description="Scrivi qui le cose da fare che non hanno ancora un giorno. Quando le completi finiscono nel diario."
        variant="naked"
      />
    </main>
  </div>
</template>
