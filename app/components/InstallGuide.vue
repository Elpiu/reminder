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
      <UIcon name="i-lucide-circle-check" class="size-5" /> L'app è installata su questo dispositivo.
    </p>
    <template v-else>
      <p class="text-muted">
        Installata, Reminder si apre come un'app, funziona senza connessione e può mostrare il numero di cose da fare sull'icona.
      </p>
      <UButton v-if="pwa?.showInstallPrompt" label="Installa l'app" icon="i-lucide-download" @click="pwa.install()" />
      <ol v-else-if="isIOS" class="list-decimal space-y-1 pl-5">
        <li>Apri questa pagina con <strong>Safari</strong>.</li>
        <li>Tocca <UIcon name="i-lucide-share" class="size-4 align-[-3px]" /> <strong>Condividi</strong>.</li>
        <li>Scegli <strong>Aggiungi alla schermata Home</strong>.</li>
      </ol>
      <ol v-else class="list-decimal space-y-1 pl-5">
        <li>Apri il menu del browser <UIcon name="i-lucide-ellipsis-vertical" class="size-4 align-[-3px]" />.</li>
        <li>Scegli <strong>Installa app</strong> o <strong>Aggiungi a schermata Home</strong>.</li>
      </ol>
    </template>
  </div>
</template>
