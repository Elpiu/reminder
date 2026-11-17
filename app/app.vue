<script setup lang="ts">
import { it } from '@nuxt/ui/locale'

useBadgeSync()
</script>

<template>
  <UApp :locale="it" :toaster="{ position: 'top-center', duration: 4000 }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
