<script setup lang="ts">
/** Scelta della lingua: salvata dal modulo i18n in un cookie e riletta a ogni avvio. */
const { locale, locales, setLocale } = useI18n()

const items = computed(() => locales.value.map(l => (typeof l === 'string' ? { label: l, value: l } : { label: l.name ?? l.code, value: l.code })))

const current = computed({
  get: () => locale.value,
  set: (code: string) => { void setLocale(code as typeof locale.value) },
})

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <USelect
    v-if="compact"
    v-model="current"
    :items="items"
    icon="i-lucide-languages"
    size="sm"
    variant="ghost"
    :aria-label="$t('common.language')"
    class="w-36"
  />
  <UTabs v-else v-model="current" :items="items" :content="false" size="sm" class="w-full" />
</template>
