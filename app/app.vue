<script setup lang="ts">
import { en, it } from '@nuxt/ui/locale'

const { locale } = useI18n()
const uiLocale = computed(() => (locale.value === 'en' ? en : it))

useHead({ htmlAttrs: { lang: () => locale.value } })
useBadgeSync()
</script>

<template>
  <UApp :locale="uiLocale" :toaster="{ position: 'top-center', duration: 4000 }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
