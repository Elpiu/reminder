<script setup lang="ts">
/** Sceglie colore (palette o personalizzato) e icona (per categoria) di un'attività. */
const icon = defineModel<string>('icon', { required: true })
const color = defineModel<string>('color', { required: true })

const category = ref<string>(ICON_CATEGORIES.find(c => c.icons.includes(icon.value))?.id ?? ICON_CATEGORIES[0]!.id)
const icons = computed(() => ICON_CATEGORIES.find(c => c.id === category.value)?.icons ?? [])

const isCustom = computed(() => !(color.value in ACTIVITY_COLORS))
const custom = ref(isCustom.value ? activityColor(color.value) : '#0f766e')
const customOpen = ref(false)

watch(custom, (hex) => {
  if (customOpen.value && /^#[0-9a-f]{6}$/i.test(hex)) color.value = hex.toLowerCase()
})

const fmt = useFmt()
const categoryItems = computed(() => ICON_CATEGORIES.map(c => ({ label: fmt.t(`icons.${c.id}`), value: c.id })))
const iconName = (i: string) => i.replace('i-lucide-', '').replace(/-/g, ' ')
</script>

<template>
  <div class="space-y-4 rounded-xl border border-default p-3" :style="{ '--act': activityColor(color) }">
    <fieldset class="min-w-0">
      <legend class="mb-2 text-sm font-medium text-highlighted">
        {{ $t('editor.color') }}
      </legend>
      <div class="grid grid-cols-10 gap-1.5" role="radiogroup" :aria-label="$t('editor.color')">
        <button
          v-for="s in COLOR_SWATCHES"
          :key="s.key"
          type="button"
          role="radio"
          :aria-checked="color === s.key"
          :aria-label="fmt.colorLabel(s)"
          :title="fmt.colorLabel(s)"
          class="relative aspect-square rounded-full ring-offset-2 ring-offset-(--ui-bg) focus-visible:outline-2 focus-visible:outline-primary"
          :class="color === s.key ? 'ring-2 ring-(--ui-text-highlighted)' : ''"
          :style="{ backgroundColor: s.hex }"
          @click="color = s.key"
        >
          <UIcon v-if="color === s.key" name="i-lucide-check" class="absolute inset-0 m-auto size-4 text-white" />
        </button>
        <UPopover v-model:open="customOpen">
          <button
            type="button"
            role="radio"
            :aria-checked="isCustom"
            :aria-label="$t('editor.custom')"
            :title="$t('editor.custom')"
            class="relative flex aspect-square items-center justify-center rounded-full ring-offset-2 ring-offset-(--ui-bg) focus-visible:outline-2 focus-visible:outline-primary"
            :class="isCustom ? 'ring-2 ring-(--ui-text-highlighted)' : 'border border-dashed border-accented'"
            :style="isCustom ? { backgroundColor: activityColor(color) } : undefined"
          >
            <UIcon :name="isCustom ? 'i-lucide-check' : 'i-lucide-pipette'" class="size-4" :class="isCustom ? 'text-white' : 'text-muted'" />
          </button>
          <template #content>
            <div class="space-y-2 p-3">
              <UColorPicker v-model="custom" format="hex" />
              <UInput v-model="custom" size="sm" :aria-label="$t('editor.hexAria')" class="w-full font-mono" />
            </div>
          </template>
        </UPopover>
      </div>
    </fieldset>

    <fieldset class="min-w-0">
      <legend class="mb-2 text-sm font-medium text-highlighted">
        {{ $t('editor.icon') }}
      </legend>
      <div class="no-scrollbar -mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3" role="tablist" :aria-label="$t('editor.iconCategories')">
        <UButton
          v-for="c in categoryItems"
          :key="c.value"
          :label="c.label"
          size="xs"
          role="tab"
          :aria-selected="category === c.value"
          :color="category === c.value ? 'primary' : 'neutral'"
          :variant="category === c.value ? 'solid' : 'soft'"
          class="shrink-0"
          @click="category = c.value"
        />
      </div>
      <div class="grid max-h-56 grid-cols-7 gap-1 overflow-y-auto sm:grid-cols-9" role="radiogroup" :aria-label="$t('editor.icon')">
        <button
          v-for="i in icons"
          :key="i"
          type="button"
          role="radio"
          :aria-checked="icon === i"
          :aria-label="iconName(i)"
          :title="iconName(i)"
          class="flex aspect-square items-center justify-center rounded-lg hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
          :class="icon === i ? 'act-soft act-text ring-1 ring-(--act)' : 'text-muted'"
          @click="icon = i"
        >
          <UIcon :name="i" class="size-5" />
        </button>
      </div>
    </fieldset>
  </div>
</template>
