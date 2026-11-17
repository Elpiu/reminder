<script setup lang="ts">
import type { Preferences } from '#shared/types/models'
import { LazyConfirmModal } from '#components'

useHead({ title: 'Impostazioni' })

const { prefs, save } = usePreferences()
const colorMode = useColorMode()
const toast = useToast()
const confirm = useOverlay().create(LazyConfirmModal)
const { data: activities } = useActivities()
const { tags } = useTags()

const themes = [
  { label: 'Sistema', value: 'system', icon: 'i-lucide-monitor-smartphone' },
  { label: 'Chiaro', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Scuro', value: 'dark', icon: 'i-lucide-moon' },
]
const scales: { label: string, value: Preferences['textScale'] }[] = [
  { label: 'Piccolo', value: 'sm' },
  { label: 'Normale', value: 'md' },
  { label: 'Grande', value: 'lg' },
  { label: 'Molto grande', value: 'xl' },
]

const weekStart = computed({
  get: () => String(prefs.value.weekStart),
  set: (v: string) => save({ weekStart: v === '7' ? 7 : 1 }),
})

const notificationsSupported = typeof Notification !== 'undefined'
const badgeSupported = typeof navigator !== 'undefined' && 'setAppBadge' in navigator

async function toggleNotify(on: boolean) {
  if (!on) return save({ notifyOnOpen: false })
  if (!notificationsSupported) return
  const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
  if (perm === 'granted') await save({ notifyOnOpen: true })
  else toast.add({ title: 'Notifiche non consentite', description: 'Puoi abilitarle dalle impostazioni del browser.', color: 'warning', icon: 'i-lucide-bell-off' })
}

// ------------------------------------------------- dati
const includePhotos = ref(true)
const exporting = ref(false)
const importing = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('file')

async function doExport() {
  exporting.value = true
  try {
    await exportBackup(includePhotos.value)
    toast.add({ title: 'Backup esportato', icon: 'i-lucide-download', color: 'success' })
  }
  catch (e) {
    toast.add({ title: 'Esportazione non riuscita', description: (e as Error).message, color: 'error' })
  }
  finally {
    exporting.value = false
  }
}

async function onImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (fileInput.value) fileInput.value.value = ''
  if (!file) return
  importing.value = true
  try {
    const data = await readBackupFile(file)
    const ok = await confirm.open({
      title: 'Sostituire tutti i dati?',
      description: `Il backup contiene ${data.activities.length} attività, ${data.entries.length} voci, ${data.inbox.length} elementi nell'inbox e ${data.photos.length} foto. I dati attuali su questo dispositivo verranno cancellati.`,
      confirmLabel: 'Importa',
      danger: true,
    })
    if (!ok) return
    await replaceAllData(data)
    toast.add({ title: 'Backup importato', icon: 'i-lucide-circle-check', color: 'success' })
  }
  catch (err) {
    toast.add({ title: 'Importazione non riuscita', description: (err as Error).message, color: 'error', icon: 'i-lucide-file-x' })
  }
  finally {
    importing.value = false
  }
}

async function doReset() {
  const ok = await confirm.open({
    title: 'Cancellare tutto?',
    description: 'Attività, diario, foto, inbox e tag verranno eliminati da questo dispositivo. Non si può annullare: esporta prima un backup se ti serve.',
    confirmLabel: 'Cancella tutto',
    danger: true,
  })
  if (!ok) return
  await resetAllData()
  await navigateTo('/benvenuto')
}

const storage = ref<string | null>(null)
onMounted(async () => {
  const est = await navigator.storage?.estimate?.()
  if (est?.usage !== undefined) storage.value = `${(est.usage / 1024 / 1024).toFixed(1)} MB`
})

const version = '2.0.0'
</script>

<template>
  <div>
    <AppHeader title="Impostazioni" back="/">
      <template #actions>
        <span />
      </template>
    </AppHeader>
    <main class="space-y-8 px-4 pb-8 pt-4">
      <!-- contenuti -->
      <section aria-labelledby="s-content" class="space-y-2">
        <h2 id="s-content" class="text-sm font-semibold uppercase tracking-wide text-muted">
          Contenuti
        </h2>
        <nav class="divide-y divide-default overflow-hidden rounded-xl border border-default">
          <NuxtLink to="/impostazioni/attivita" class="flex items-center gap-3 p-3 hover:bg-elevated/50">
            <UIcon name="i-lucide-list-checks" class="size-5 text-primary" />
            <span class="flex-1 font-medium text-highlighted">Attività</span>
            <span class="text-sm text-muted">{{ activities.filter(a => !a.archived).length }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
          </NuxtLink>
          <NuxtLink to="/impostazioni/tag" class="flex items-center gap-3 p-3 hover:bg-elevated/50">
            <UIcon name="i-lucide-tags" class="size-5 text-primary" />
            <span class="flex-1 font-medium text-highlighted">Tag</span>
            <span class="text-sm text-muted">{{ tags.length }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
          </NuxtLink>
        </nav>
      </section>

      <!-- aspetto -->
      <section aria-labelledby="s-look" class="space-y-4">
        <h2 id="s-look" class="text-sm font-semibold uppercase tracking-wide text-muted">
          Aspetto
        </h2>
        <UFormField label="Tema">
          <UTabs v-model="colorMode.preference" :items="themes" :content="false" size="sm" class="w-full" />
        </UFormField>
        <UFormField label="Dimensione del testo">
          <UTabs :model-value="prefs.textScale" :items="scales" :content="false" size="sm" class="w-full" @update:model-value="v => save({ textScale: v as Preferences['textScale'] })" />
        </UFormField>
        <UFormField label="La settimana inizia di">
          <UTabs v-model="weekStart" :items="[{ label: 'Lunedì', value: '1' }, { label: 'Domenica', value: '7' }]" :content="false" size="sm" class="w-full" />
        </UFormField>
      </section>

      <!-- promemoria -->
      <section aria-labelledby="s-rem" class="space-y-4">
        <h2 id="s-rem" class="text-sm font-semibold uppercase tracking-wide text-muted">
          Promemoria
        </h2>
        <USwitch
          :model-value="prefs.badge"
          label="Numero sull'icona dell'app"
          :description="badgeSupported ? 'Quante cose restano da fare oggi (app installata).' : 'Non supportato da questo browser.'"
          :disabled="!badgeSupported"
          @update:model-value="v => save({ badge: v })"
        />
        <USwitch
          :model-value="prefs.notifyOnOpen"
          label="Notifica quando apri l'app"
          :description="notificationsSupported ? 'Un riepilogo di cosa c\'è da fare oggi.' : 'Non supportato da questo browser.'"
          :disabled="!notificationsSupported"
          @update:model-value="toggleNotify"
        />
        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-lucide-info"
          title="Perché niente notifiche a orario?"
          description="Reminder salva tutto solo sul tuo dispositivo, senza server. Senza un server il browser non permette di programmare notifiche affidabili ad app chiusa."
        />
      </section>

      <!-- installazione -->
      <section aria-labelledby="s-install" class="space-y-3">
        <h2 id="s-install" class="text-sm font-semibold uppercase tracking-wide text-muted">
          Installa
        </h2>
        <InstallGuide />
      </section>

      <!-- dati -->
      <section aria-labelledby="s-data" class="space-y-4">
        <h2 id="s-data" class="text-sm font-semibold uppercase tracking-wide text-muted">
          Dati e backup
        </h2>
        <p class="text-sm text-muted">
          I dati restano solo su questo dispositivo<span v-if="storage"> ({{ storage }})</span>. Esporta un backup per spostarli o conservarli.
        </p>
        <div class="space-y-3 rounded-xl border border-default bg-elevated/40 p-3">
          <USwitch v-model="includePhotos" label="Includi le foto" description="Il file sarà più grande." />
          <UButton label="Esporta backup" icon="i-lucide-download" :loading="exporting" block @click="doExport" />
        </div>
        <input
          ref="file"
          type="file"
          accept="application/json,.json"
          class="sr-only"
          tabindex="-1"
          aria-hidden="true"
          @change="onImport"
        >
        <UButton
          label="Importa backup"
          icon="i-lucide-upload"
          color="neutral"
          variant="soft"
          block
          :loading="importing"
          @click="fileInput?.click()"
        />
        <p class="text-xs text-muted">
          Accetta anche i backup della versione precedente di Reminder: note, todo, ricorrenti e categorie vengono convertiti.
        </p>
        <UButton label="Cancella tutti i dati" icon="i-lucide-trash-2" color="error" variant="ghost" block @click="doReset" />
      </section>

      <p class="text-center text-xs text-muted">
        Reminder {{ version }} · funziona offline · nessun account
      </p>
    </main>
  </div>
</template>
