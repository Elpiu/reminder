<script setup lang="ts">
import { LazyConfirmModal } from '#components'

definePageMeta({ layout: 'bare' })

const fmt = useFmt()
const { t } = fmt
const { packs } = usePresets()
useHead({ title: () => t('welcome.title') })

const step = ref<1 | 2 | 3>(1)
const selected = ref<string[]>(['wellbeing'])
const saving = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('file')
const toast = useToast()
const confirm = useOverlay().create(LazyConfirmModal)
const base = useRuntimeConfig().app.baseURL

function toggle(id: string) {
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}

const chosen = computed(() => packs.value.filter(p => selected.value.includes(p.id)))
const chosenCount = computed(() => chosen.value.reduce((n, p) => n + p.activities.length, 0))

async function finish() {
  saving.value = true
  try {
    const seen = new Set<string>()
    const list = chosen.value.flatMap(p => p.activities).filter((a) => {
      if (seen.has(a.name)) return false
      seen.add(a.name)
      return true
    })
    await addPresetActivities(list)
    await savePreferences({ onboarded: true })
    await navigateTo('/', { replace: true })
  }
  finally {
    saving.value = false
  }
}

async function onImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const data = await readBackupFile(file)
    const ok = await confirm.open({
      title: t('welcome.importTitle'),
      description: t('welcome.importDescription', { activities: data.activities.length, entries: data.entries.length, inbox: data.inbox.length }),
      confirmLabel: t('settings.importAction'),
    })
    if (!ok) return
    await replaceAllData(data)
    toast.add({ title: t('welcome.welcomeBack'), color: 'success', icon: 'i-lucide-circle-check' })
    await navigateTo('/', { replace: true })
  }
  catch (err) {
    toast.add({ title: t('settings.importFailed'), description: fmt.error(err), color: 'error' })
  }
}

const points = computed(() => [
  { icon: 'i-lucide-list-checks', title: t('welcome.p1Title'), text: t('welcome.p1') },
  { icon: 'i-lucide-notebook-pen', title: t('welcome.p2Title'), text: t('welcome.p2') },
  { icon: 'i-lucide-chart-no-axes-column', title: t('welcome.p3Title'), text: t('welcome.p3') },
  { icon: 'i-lucide-shield-check', title: '', text: t('welcome.p4') },
])
</script>

<template>
  <main class="flex flex-1 flex-col px-6 pb-6 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
    <div class="mb-6 flex items-center justify-between gap-3">
      <ol class="flex gap-2" :aria-label="$t('welcome.steps')">
        <li
          v-for="n in 3"
          :key="n"
          class="h-1.5 w-8 rounded-full transition-colors"
          :class="n <= step ? 'bg-primary' : 'bg-accented'"
          :aria-current="n === step ? 'step' : undefined"
        />
      </ol>
      <LanguagePicker compact />
    </div>

    <!-- 1: cos'è -->
    <section v-if="step === 1" class="flex flex-1 flex-col">
      <div class="flex flex-1 flex-col justify-center gap-6">
        <img :src="`${base}icon.svg`" alt="" class="size-20 rounded-3xl shadow-lg">
        <h1 class="font-serif text-4xl font-semibold leading-tight text-highlighted">
          {{ $t('welcome.headline1') }}<br>{{ $t('welcome.headline2') }}
        </h1>
        <ul class="space-y-4 text-default">
          <li v-for="p in points" :key="p.icon" class="flex gap-3">
            <UIcon :name="p.icon" class="mt-0.5 size-5 shrink-0 text-primary" />
            <span><strong v-if="p.title">{{ p.title }}</strong> {{ p.text }}</span>
          </li>
        </ul>
      </div>
      <UButton :label="$t('welcome.start')" trailing-icon="i-lucide-arrow-right" size="xl" block class="mt-8" @click="step = 2" />
      <input
        ref="file"
        type="file"
        accept="application/json,.json"
        class="sr-only"
        tabindex="-1"
        aria-hidden="true"
        @change="onImport"
      >
      <UButton :label="$t('welcome.haveBackup')" color="neutral" variant="ghost" block class="mt-2" @click="fileInput?.click()" />
    </section>

    <!-- 2: pacchetti -->
    <section v-else-if="step === 2" class="flex flex-1 flex-col">
      <h1 class="font-serif text-3xl font-semibold text-highlighted">
        {{ $t('welcome.packsTitle') }}
      </h1>
      <p class="mt-2 text-muted">
        {{ $t('welcome.packsDescription') }}
      </p>
      <ul class="mt-6 space-y-3">
        <li v-for="p in packs" :key="p.id">
          <button
            type="button"
            class="flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            :class="selected.includes(p.id) ? 'border-primary bg-primary/10' : 'border-default hover:bg-elevated'"
            :aria-pressed="selected.includes(p.id)"
            @click="toggle(p.id)"
          >
            <UIcon :name="p.icon" class="mt-0.5 size-6 shrink-0 text-primary" />
            <span class="flex-1">
              <span class="block font-semibold text-highlighted">{{ p.name }}</span>
              <span class="block text-sm text-muted">{{ p.description }}</span>
              <span class="mt-2 flex flex-wrap gap-1">
                <span v-for="a in p.activities" :key="a.name" class="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-0.5 text-xs text-default">
                  <UIcon :name="a.icon" class="size-3" />{{ a.name }}
                </span>
              </span>
            </span>
            <UIcon :name="selected.includes(p.id) ? 'i-lucide-circle-check' : 'i-lucide-circle'" class="size-6 shrink-0" :class="selected.includes(p.id) ? 'text-primary' : 'text-muted'" />
          </button>
        </li>
      </ul>
      <div class="mt-auto flex gap-2 pt-8">
        <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="xl" :aria-label="$t('common.back')" @click="step = 1" />
        <UButton
          :label="$t('welcome.continueWith', chosenCount)"
          trailing-icon="i-lucide-arrow-right"
          size="xl"
          block
          class="flex-1"
          @click="step = 3"
        />
      </div>
    </section>

    <!-- 3: installazione -->
    <section v-else class="flex flex-1 flex-col">
      <h1 class="font-serif text-3xl font-semibold text-highlighted">
        {{ $t('welcome.installTitle') }}
      </h1>
      <p class="mt-2 text-muted">
        {{ $t('welcome.installDescription') }}
      </p>
      <div class="mt-6 rounded-xl border border-default bg-elevated/40 p-4">
        <InstallGuide />
      </div>
      <div class="mt-auto flex gap-2 pt-8">
        <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="xl" :aria-label="$t('common.back')" @click="step = 2" />
        <UButton :label="$t('welcome.open')" icon="i-lucide-sun" size="xl" block class="flex-1" :loading="saving" @click="finish" />
      </div>
    </section>
  </main>
</template>
