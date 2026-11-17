<script setup lang="ts">
import { LazyConfirmModal } from '#components'

definePageMeta({ layout: 'bare' })
useHead({ title: 'Benvenuto' })

const step = ref<1 | 2 | 3>(1)
const selected = ref<string[]>(['benessere'])
const saving = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('file')
const toast = useToast()
const confirm = useOverlay().create(LazyConfirmModal)

function toggle(id: string) {
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}

const chosenCount = computed(() => PRESET_PACKS.filter(p => selected.value.includes(p.id)).reduce((n, p) => n + p.activities.length, 0))

async function finish() {
  saving.value = true
  try {
    const seen = new Set<string>()
    const list = PRESET_PACKS.filter(p => selected.value.includes(p.id)).flatMap(p => p.activities).filter((a) => {
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
      title: 'Importare questo backup?',
      description: `${data.activities.length} attività, ${data.entries.length} voci, ${data.inbox.length} elementi nell'inbox.`,
      confirmLabel: 'Importa',
    })
    if (!ok) return
    await replaceAllData(data)
    toast.add({ title: 'Bentornato! Dati importati.', color: 'success', icon: 'i-lucide-circle-check' })
    await navigateTo('/', { replace: true })
  }
  catch (err) {
    toast.add({ title: 'Importazione non riuscita', description: (err as Error).message, color: 'error' })
  }
}
</script>

<template>
  <main class="flex flex-1 flex-col px-6 pb-6 pt-[calc(env(safe-area-inset-top)+2rem)]">
    <ol class="mb-8 flex justify-center gap-2" aria-label="Passaggi">
      <li v-for="n in 3" :key="n" class="h-1.5 w-8 rounded-full transition-colors" :class="n <= step ? 'bg-primary' : 'bg-accented'" :aria-current="n === step ? 'step' : undefined" />
    </ol>

    <!-- 1: cos'è -->
    <section v-if="step === 1" class="flex flex-1 flex-col">
      <div class="flex flex-1 flex-col justify-center gap-6">
        <img :src="`${useRuntimeConfig().app.baseURL}icon.svg`" alt="" class="size-20 rounded-3xl shadow-lg">
        <h1 class="font-serif text-4xl font-semibold leading-tight text-highlighted">
          Il tuo diario<br>di ogni giorno.
        </h1>
        <ul class="space-y-4 text-default">
          <li class="flex gap-3">
            <UIcon name="i-lucide-list-checks" class="mt-0.5 size-5 shrink-0 text-primary" />
            <span><strong>Attività</strong> che decidi tu — abitudini, misure, faccende — con le loro ricorrenze. Le segni con un tap.</span>
          </li>
          <li class="flex gap-3">
            <UIcon name="i-lucide-notebook-pen" class="mt-0.5 size-5 shrink-0 text-primary" />
            <span><strong>Diario</strong> per pensieri, fatti e foto della giornata.</span>
          </li>
          <li class="flex gap-3">
            <UIcon name="i-lucide-chart-no-axes-column" class="mt-0.5 size-5 shrink-0 text-primary" />
            <span><strong>Andamento</strong> con serie e progressi nel tempo.</span>
          </li>
          <li class="flex gap-3">
            <UIcon name="i-lucide-shield-check" class="mt-0.5 size-5 shrink-0 text-primary" />
            <span>Tutto resta <strong>sul tuo dispositivo</strong>, anche offline. Niente account.</span>
          </li>
        </ul>
      </div>
      <UButton label="Iniziamo" trailing-icon="i-lucide-arrow-right" size="xl" block class="mt-8" @click="step = 2" />
      <input ref="file" type="file" accept="application/json,.json" class="sr-only" tabindex="-1" aria-hidden="true" @change="onImport">
      <UButton label="Ho già un backup" color="neutral" variant="ghost" block class="mt-2" @click="fileInput?.click()" />
    </section>

    <!-- 2: pacchetti -->
    <section v-else-if="step === 2" class="flex flex-1 flex-col">
      <h1 class="font-serif text-3xl font-semibold text-highlighted">
        Cosa vuoi tenere d'occhio?
      </h1>
      <p class="mt-2 text-muted">
        Scegli uno o più pacchetti per partire. Potrai cambiare, togliere o aggiungere attività quando vuoi.
      </p>
      <ul class="mt-6 space-y-3">
        <li v-for="p in PRESET_PACKS" :key="p.id">
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
        <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="xl" aria-label="Indietro" @click="step = 1" />
        <UButton
          :label="chosenCount ? `Continua con ${chosenCount} attività` : 'Parti da zero'"
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
        Tienila a portata di pollice
      </h1>
      <p class="mt-2 text-muted">
        Aggiungi Reminder alla schermata Home: si apre come un'app e funziona anche senza rete.
      </p>
      <div class="mt-6 rounded-xl border border-default bg-elevated/40 p-4">
        <InstallGuide />
      </div>
      <div class="mt-auto flex gap-2 pt-8">
        <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="xl" aria-label="Indietro" @click="step = 2" />
        <UButton label="Apri il diario" icon="i-lucide-sun" size="xl" block class="flex-1" :loading="saving" @click="finish" />
      </div>
    </section>
  </main>
</template>
