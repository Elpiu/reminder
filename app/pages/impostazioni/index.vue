<script setup lang="ts">
import type { Preferences } from '#shared/types/models'
import { LazyConfirmModal } from '#components'

const fmt = useFmt()
const { t } = fmt
useHead({ title: () => t('settings.title') })

const { prefs, save } = usePreferences()
const colorMode = useColorMode()
const toast = useToast()
const confirm = useOverlay().create(LazyConfirmModal)
const { data: activities } = useActivities()
const { tags } = useTags()

const themes = computed(() => [
  { label: t('settings.system'), value: 'system', icon: 'i-lucide-monitor-smartphone' },
  { label: t('settings.light'), value: 'light', icon: 'i-lucide-sun' },
  { label: t('settings.dark'), value: 'dark', icon: 'i-lucide-moon' },
])
const scales = computed<{ label: string, value: Preferences['textScale'] }[]>(() => [
  { label: t('settings.sizeSm'), value: 'sm' },
  { label: t('settings.sizeMd'), value: 'md' },
  { label: t('settings.sizeLg'), value: 'lg' },
  { label: t('settings.sizeXl'), value: 'xl' },
])

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
  else toast.add({ title: t('settings.notifyDenied'), description: t('settings.notifyDeniedDescription'), color: 'warning', icon: 'i-lucide-bell-off' })
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
    toast.add({ title: t('settings.exported'), icon: 'i-lucide-download', color: 'success' })
  }
  catch (e) {
    toast.add({ title: t('settings.exportFailed'), description: fmt.error(e), color: 'error' })
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
      title: t('settings.importConfirmTitle'),
      description: t('settings.importConfirmDescription', { activities: data.activities.length, entries: data.entries.length, inbox: data.inbox.length, photos: data.photos.length }),
      confirmLabel: t('settings.importAction'),
      danger: true,
    })
    if (!ok) return
    await replaceAllData(data)
    toast.add({ title: t('settings.imported'), icon: 'i-lucide-circle-check', color: 'success' })
  }
  catch (err) {
    toast.add({ title: t('settings.importFailed'), description: fmt.error(err), color: 'error', icon: 'i-lucide-file-x' })
  }
  finally {
    importing.value = false
  }
}

async function doReset() {
  const ok = await confirm.open({
    title: t('settings.resetTitle'),
    description: t('settings.resetDescription'),
    confirmLabel: t('settings.resetAction'),
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
    <AppHeader :title="$t('settings.title')" back="/">
      <template #actions>
        <span />
      </template>
    </AppHeader>
    <main class="space-y-8 px-4 pb-8 pt-4">
      <!-- contenuti -->
      <section aria-labelledby="s-content" class="space-y-2">
        <h2 id="s-content" class="text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('settings.content') }}
        </h2>
        <nav class="divide-y divide-default overflow-hidden rounded-xl border border-default">
          <NuxtLink to="/impostazioni/attivita" class="flex items-center gap-3 p-3 hover:bg-elevated/50">
            <UIcon name="i-lucide-list-checks" class="size-5 text-primary" />
            <span class="flex-1 font-medium text-highlighted">{{ $t('settings.activities') }}</span>
            <span class="text-sm text-muted">{{ activities.filter(a => !a.archived).length }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
          </NuxtLink>
          <NuxtLink to="/impostazioni/tag" class="flex items-center gap-3 p-3 hover:bg-elevated/50">
            <UIcon name="i-lucide-tags" class="size-5 text-primary" />
            <span class="flex-1 font-medium text-highlighted">{{ $t('settings.tags') }}</span>
            <span class="text-sm text-muted">{{ tags.length }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
          </NuxtLink>
        </nav>
      </section>

      <!-- aspetto -->
      <section aria-labelledby="s-look" class="space-y-4">
        <h2 id="s-look" class="text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('settings.look') }}
        </h2>
        <UFormField :label="$t('common.language')">
          <LanguagePicker />
        </UFormField>
        <UFormField :label="$t('settings.theme')">
          <UTabs v-model="colorMode.preference" :items="themes" :content="false" size="sm" class="w-full" />
        </UFormField>
        <UFormField :label="$t('settings.textSize')">
          <UTabs :model-value="prefs.textScale" :items="scales" :content="false" size="sm" class="w-full" @update:model-value="v => save({ textScale: v as Preferences['textScale'] })" />
        </UFormField>
        <UFormField :label="$t('settings.weekStart')">
          <UTabs v-model="weekStart" :items="[{ label: $t('settings.monday'), value: '1' }, { label: $t('settings.sunday'), value: '7' }]" :content="false" size="sm" class="w-full" />
        </UFormField>
      </section>

      <!-- promemoria -->
      <section aria-labelledby="s-rem" class="space-y-4">
        <h2 id="s-rem" class="text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('settings.reminders') }}
        </h2>
        <USwitch
          :model-value="prefs.badge"
          :label="$t('settings.badge')"
          :description="badgeSupported ? $t('settings.badgeDescription') : $t('settings.unsupported')"
          :disabled="!badgeSupported"
          @update:model-value="v => save({ badge: v })"
        />
        <USwitch
          :model-value="prefs.notifyOnOpen"
          :label="$t('settings.notify')"
          :description="notificationsSupported ? $t('settings.notifyDescription') : $t('settings.unsupported')"
          :disabled="!notificationsSupported"
          @update:model-value="toggleNotify"
        />
        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-lucide-info"
          :title="$t('settings.whyTitle')"
          :description="$t('settings.whyDescription')"
        />
      </section>

      <!-- installazione -->
      <section aria-labelledby="s-install" class="space-y-3">
        <h2 id="s-install" class="text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('settings.install') }}
        </h2>
        <InstallGuide />
      </section>

      <!-- dati -->
      <section aria-labelledby="s-data" class="space-y-4">
        <h2 id="s-data" class="text-sm font-semibold uppercase tracking-wide text-muted">
          {{ $t('settings.data') }}
        </h2>
        <p class="text-sm text-muted">
          {{ $t('settings.dataLocal') }}<span v-if="storage"> ({{ storage }})</span>. {{ $t('settings.dataExport') }}
        </p>
        <div class="space-y-3 rounded-xl border border-default bg-elevated/40 p-3">
          <USwitch v-model="includePhotos" :label="$t('settings.includePhotos')" :description="$t('settings.includePhotosDescription')" />
          <UButton :label="$t('settings.export')" icon="i-lucide-download" :loading="exporting" block @click="doExport" />
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
          :label="$t('settings.import')"
          icon="i-lucide-upload"
          color="neutral"
          variant="soft"
          block
          :loading="importing"
          @click="fileInput?.click()"
        />
        <p class="text-xs text-muted">
          {{ $t('settings.importHint') }}
        </p>
        <UButton :label="$t('settings.reset')" icon="i-lucide-trash-2" color="error" variant="ghost" block @click="doReset" />
      </section>

      <p class="text-center text-xs text-muted">
        {{ $t('settings.footer', { version }) }}
      </p>
    </main>
  </div>
</template>
