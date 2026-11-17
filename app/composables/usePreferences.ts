import { DEFAULT_PREFERENCES, type Preferences } from '#shared/types/models'

const state = ref<Preferences>({ ...DEFAULT_PREFERENCES })
const loaded = ref(false)
let loading: Promise<void> | null = null

const SCALE: Record<Preferences['textScale'], string> = { sm: '0.9', md: '1', lg: '1.12', xl: '1.25' }

function applyScale(p: Preferences) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--app-scale', SCALE[p.textScale])
  }
}

export async function loadPreferences(): Promise<void> {
  if (loaded.value) return
  loading ??= (async () => {
    const row = await useDb().settings.get('preferences')
    state.value = { ...DEFAULT_PREFERENCES, ...(row?.value ?? {}) }
    applyScale(state.value)
    loaded.value = true
  })()
  return loading
}

export async function savePreferences(patch: Partial<Preferences>): Promise<void> {
  state.value = { ...state.value, ...patch }
  applyScale(state.value)
  await useDb().settings.put({ key: 'preferences', value: toRaw(state.value) })
}

/** Ricarica dopo import/reset. */
export async function reloadPreferences(): Promise<void> {
  loaded.value = false
  loading = null
  await loadPreferences()
}

export function usePreferences() {
  return {
    prefs: readonly(state),
    loaded: readonly(loaded),
    save: savePreferences,
  }
}
