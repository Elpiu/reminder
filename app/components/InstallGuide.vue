<script setup lang="ts">
const pwa = usePWA()
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const isIOS = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Mac') && typeof document !== 'undefined' && 'ontouchend' in document)
const standalone = typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)
const installed = computed(() => standalone || !!pwa?.isPWAInstalled)
</script>

<template>
  <div class="space-y-3 text-sm">
    <p v-if="installed" class="flex items-center gap-2 text-success">
      <UIcon name="i-lucide-circle-check" class="size-5" /> {{ $t('install.installed') }}
    </p>
    <template v-else>
      <p class="text-muted">
        {{ $t('install.why') }}
      </p>
      <UButton v-if="pwa?.showInstallPrompt" :label="$t('install.button')" icon="i-lucide-download" @click="pwa.install()" />
      <ol v-else-if="isIOS" class="list-decimal space-y-1 pl-5">
        <li>{{ $t('install.ios1') }}</li>
        <li><UIcon name="i-lucide-share" class="size-4 align-[-3px]" /> {{ $t('install.ios2') }}</li>
        <li>{{ $t('install.ios3') }}</li>
      </ol>
      <ol v-else class="list-decimal space-y-1 pl-5">
        <li><UIcon name="i-lucide-ellipsis-vertical" class="size-4 align-[-3px]" /> {{ $t('install.android1') }}</li>
        <li>{{ $t('install.android2') }}</li>
      </ol>
    </template>
  </div>
</template>
