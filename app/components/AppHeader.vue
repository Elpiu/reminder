<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  back?: string
}>()
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-default/60 bg-default/90 backdrop-blur safe-top">
    <div class="flex min-h-14 items-center gap-2 px-4 py-2">
      <UButton
        v-if="back"
        :to="back"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        :aria-label="$t('common.back')"
        class="-ml-2"
      />
      <div class="min-w-0 flex-1">
        <h1 class="truncate font-serif text-xl font-semibold text-highlighted">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="truncate text-xs text-muted">
          {{ subtitle }}
        </p>
      </div>
      <slot name="actions">
        <UButton to="/cerca" icon="i-lucide-search" color="neutral" variant="ghost" :aria-label="$t('common.search')" />
        <UButton to="/impostazioni" icon="i-lucide-settings" color="neutral" variant="ghost" :aria-label="$t('common.settings')" />
      </slot>
    </div>
    <slot name="bottom" />
  </header>
</template>
