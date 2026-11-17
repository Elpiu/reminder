<script setup lang="ts">
import type { Entry } from '#shared/types/models'
import { LazyNoteEditor, LazyPhotoViewer } from '#components'

const props = defineProps<{ entry: Entry, showDate?: boolean }>()

const overlay = useOverlay()
const editor = overlay.create(LazyNoteEditor)
const viewer = overlay.create(LazyPhotoViewer)
const fmt = useFmt()

const menu = computed(() => [[
  { label: fmt.t('common.edit'), icon: 'i-lucide-pencil', onSelect: () => editor.open({ entry: props.entry, date: props.entry.date }) },
  { label: fmt.t('common.delete'), icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => deleteEntry(props.entry) },
]])
</script>

<template>
  <article class="group rounded-xl border border-default bg-elevated/40 p-3 transition-colors hover:bg-elevated">
    <div class="flex items-start gap-3">
      <button
        type="button"
        class="min-w-0 flex-1 rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary"
        :aria-label="$t('note.edit')"
        @click="editor.open({ entry, date: entry.date })"
      >
        <p class="mb-1 text-xs font-medium tabular-nums text-muted">
          <span v-if="showDate">{{ fmt.shortDate(entry.date) }} · </span>{{ entry.time }}
          <UIcon v-if="entry.source === 'inbox'" name="i-lucide-inbox" class="ml-1 size-3 align-[-1px]" />
        </p>
        <p class="diary-text line-clamp-[12] text-[0.95rem] leading-relaxed text-highlighted">{{ entry.text }}</p>
      </button>
      <UDropdownMenu :items="menu" :content="{ align: 'end' }">
        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" :aria-label="$t('note.actionsAria')" />
      </UDropdownMenu>
    </div>
    <ul v-if="entry.photoIds.length" class="mt-2 grid grid-cols-3 gap-1.5" :aria-label="$t('note.photos')">
      <li v-for="(p, i) in entry.photoIds" :key="p" class="aspect-square overflow-hidden rounded-lg">
        <button
          type="button"
          class="size-full focus-visible:outline-2 focus-visible:outline-primary"
          :aria-label="$t('note.openPhoto', { n: i + 1 })"
          @click="viewer.open({ ids: entry.photoIds, start: i })"
        >
          <PhotoThumb :id="p" />
        </button>
      </li>
    </ul>
    <TagChips :ids="entry.tagIds" class="mt-2" />
  </article>
</template>
