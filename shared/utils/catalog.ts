import type { Activity, ActivityColor, ValueKind } from '../types/models'

const lucide = (names: string) => names.trim().split(/\s+/).map(n => `i-lucide-${n}`)

/** Icone selezionabili per le attività, divise per categoria (tutte incluse nel bundle: vedi nuxt.config). */
/** Categorie di icone; i nomi sono nelle traduzioni (`icons.<id>`). */
export const ICON_CATEGORIES: { id: string, icons: string[] }[] = [
  { id: 'health', icons: lucide(`circle-check heart heart-pulse pill pill-bottle syringe stethoscope thermometer activity brain
    eye ear smile smile-plus laugh meh frown bed bed-double moon moon-star sun sunrise sunset scale cigarette-off wine-off
    hand-heart bandage cross shield-plus droplet droplets flower-2`) },
  { id: 'sport', icons: lucide(`footprints bike dumbbell trophy medal volleyball goal waves mountain mountain-snow tent
    person-standing timer flame zap target swords sailboat`) },
  { id: 'food', icons: lucide(`apple banana carrot cherry citrus grape salad soup sandwich pizza croissant cookie cake-slice
    ice-cream-cone egg-fried beef fish drumstick utensils utensils-crossed chef-hat coffee cup-soda glass-water milk beer wine martini`) },
  { id: 'home', icons: lucide(`house sofa lamp bath shower-head bed-single washing-machine refrigerator microwave spray-can
    brush paint-roller hammer wrench drill plug lightbulb key door-open trash-2 recycle shirt sprout flower trees`) },
  { id: 'work', icons: lucide(`briefcase laptop monitor keyboard smartphone mail inbox phone calendar calendar-check
    clipboard-list file-text folder presentation chart-line chart-pie printer pen-line pencil notebook-pen book-open book
    library graduation-cap school languages code`) },
  { id: 'leisure', icons: lucide(`music headphones guitar piano mic tv film clapperboard gamepad-2 dice-5 puzzle palette
    camera image book-heart drama ticket plane map compass globe tent-tree`) },
  { id: 'nature', icons: lucide('leaf leafy-green tree-pine tree-deciduous cloud cloud-rain snowflake rainbow umbrella wind shell bug') },
  { id: 'animals', icons: lucide('dog cat bird fish-symbol rabbit turtle squirrel paw-print rat snail') },
  { id: 'people', icons: lucide('user users baby heart-handshake hand handshake message-circle phone-call gift party-popper cake church') },
  { id: 'money', icons: lucide(`wallet piggy-bank coins banknote credit-card receipt shopping-cart shopping-bag store tag badge-euro
    landmark chart-candlestick`) },
  { id: 'transport', icons: lucide('car bus train-front tram-front plane-takeoff ship fuel parking-meter scooter') },
  { id: 'symbols', icons: lucide(`square-check check star sparkles repeat calendar-days clock alarm-clock bell bell-ring flag
    bookmark pin map-pin infinity hash award crown gem rocket anchor feather sticker`) },
]

/** Tutte le icone selezionabili, senza duplicati. */
export const ACTIVITY_ICONS: string[] = [...new Set(ICON_CATEGORIES.flatMap(c => c.icons))]

export interface ColorSwatch {
  key: string
  /** Tinta, tradotta con `colors.<hue>`. */
  hue: string
  dark: boolean
  hex: string
}

const HUES: [key: string, base: string, dark: string][] = [
  ['red', '#ef4444', '#b91c1c'],
  ['orange', '#f97316', '#c2410c'],
  ['amber', '#f59e0b', '#b45309'],
  ['yellow', '#eab308', '#a16207'],
  ['lime', '#84cc16', '#4d7c0f'],
  ['green', '#22c55e', '#15803d'],
  ['emerald', '#10b981', '#047857'],
  ['teal', '#14b8a6', '#0f766e'],
  ['cyan', '#06b6d4', '#0e7490'],
  ['sky', '#0ea5e9', '#0369a1'],
  ['blue', '#3b82f6', '#1d4ed8'],
  ['indigo', '#6366f1', '#4338ca'],
  ['violet', '#8b5cf6', '#6d28d9'],
  ['purple', '#a855f7', '#7e22ce'],
  ['fuchsia', '#d946ef', '#a21caf'],
  ['pink', '#ec4899', '#be185d'],
  ['rose', '#f43f5e', '#be123c'],
  ['slate', '#64748b', '#334155'],
  ['stone', '#78716c', '#44403c'],
]

/** Palette: per ogni tinta un tono vivo e uno scuro. */
export const COLOR_SWATCHES: ColorSwatch[] = HUES.flatMap(([key, base, dark]) => [
  { key, hue: key, dark: false, hex: base },
  { key: `${key}-dark`, hue: key, dark: true, hex: dark },
])

export const ACTIVITY_COLORS: Record<string, string> = Object.fromEntries(COLOR_SWATCHES.map(s => [s.key, s.hex]))

const HEX = /^#[0-9a-f]{6}$/i

/** Un colore attività valido: chiave della palette o colore personalizzato `#rrggbb`. */
export function isActivityColor(value: unknown): value is ActivityColor {
  return typeof value === 'string' && (value in ACTIVITY_COLORS || HEX.test(value))
}

/** Colore esadecimale di un'attività (palette o personalizzato), con ripiego sul verde acqua. */
export function activityColor(color: ActivityColor | null | undefined): string {
  if (!color) return ACTIVITY_COLORS.teal!
  return ACTIVITY_COLORS[color] ?? (HEX.test(color) ? color : ACTIVITY_COLORS.teal!)
}

/** Icona di ogni tipo di valore; etichette e suggerimenti sono nei file di traduzione (`kinds.*`). */
export const KIND_ICONS: Record<ValueKind, string> = {
  check: 'i-lucide-square-check',
  counter: 'i-lucide-plus',
  number: 'i-lucide-hash',
  duration: 'i-lucide-timer',
  scale: 'i-lucide-gauge',
  choice: 'i-lucide-list',
  text: 'i-lucide-text',
}

export const VALUE_KINDS = Object.keys(KIND_ICONS) as ValueKind[]

export const MOOD_LABELS = ['😞', '😕', '😐', '🙂', '😄']

export type ActivityPreset = Omit<Activity, 'id' | 'order' | 'archived' | 'createdAt' | 'updatedAt' | 'startDate' | 'tagIds'>

/**
 * Attività di un pacchetto: nome, unità e scelte arrivano dalle traduzioni
 * (`presets.activities.<key>.name|unit|choices`) al momento della creazione.
 */
export type PresetActivity = Omit<ActivityPreset, 'name' | 'unit' | 'choices'> & { key: string }

const base = { goal: null, step: 1, scaleLabels: [] as string[], time: null }

export interface PresetPack {
  /** Nome e descrizione: `presets.packs.<id>.name|description`. */
  id: string
  icon: string
  activities: PresetActivity[]
}

export const PRESET_PACKS: PresetPack[] = [
  {
    id: 'wellbeing',
    icon: 'i-lucide-heart-pulse',
    activities: [
      { ...base, key: 'water', icon: 'i-lucide-glass-water', color: 'sky', kind: 'counter', goal: { op: 'gte', target: 8 }, recurrence: { type: 'daily' } },
      { ...base, key: 'walk', icon: 'i-lucide-footprints', color: 'emerald', kind: 'duration', goal: { op: 'gte', target: 30 }, recurrence: { type: 'daily' } },
      { ...base, key: 'workout', icon: 'i-lucide-dumbbell', color: 'orange', kind: 'choice', recurrence: { type: 'weekly', times: 3 } },
      { ...base, key: 'sleep', icon: 'i-lucide-bed', color: 'indigo', kind: 'duration', goal: { op: 'gte', target: 420 }, recurrence: { type: 'daily' }, time: '08:00' },
      { ...base, key: 'mood', icon: 'i-lucide-smile', color: 'amber', kind: 'scale', scaleLabels: MOOD_LABELS, recurrence: { type: 'daily' }, time: '21:00' },
    ],
  },
  {
    id: 'home',
    icon: 'i-lucide-house',
    activities: [
      { ...base, key: 'laundry', icon: 'i-lucide-washing-machine', color: 'cyan', kind: 'check', recurrence: { type: 'weekdays', days: [1, 4] } },
      { ...base, key: 'plants', icon: 'i-lucide-sprout', color: 'lime', kind: 'check', recurrence: { type: 'interval', every: 3 } },
      { ...base, key: 'groceries', icon: 'i-lucide-shopping-cart', color: 'rose', kind: 'number', recurrence: { type: 'none' } },
      { ...base, key: 'cleaning', icon: 'i-lucide-spray-can', color: 'violet', kind: 'check', recurrence: { type: 'weekdays', days: [6] } },
      { ...base, key: 'bills', icon: 'i-lucide-receipt', color: 'stone', kind: 'check', recurrence: { type: 'monthly', day: 1 } },
    ],
  },
  {
    id: 'study',
    icon: 'i-lucide-graduation-cap',
    activities: [
      { ...base, key: 'focus', icon: 'i-lucide-target', color: 'teal', kind: 'duration', goal: { op: 'gte', target: 120 }, recurrence: { type: 'weekdays', days: [1, 2, 3, 4, 5] } },
      { ...base, key: 'reading', icon: 'i-lucide-book-open', color: 'amber', kind: 'number', goal: { op: 'gte', target: 20 }, recurrence: { type: 'daily' } },
      { ...base, key: 'language', icon: 'i-lucide-languages', color: 'fuchsia', kind: 'check', recurrence: { type: 'weekly', times: 4 } },
      { ...base, key: 'learned', icon: 'i-lucide-pen-line', color: 'sky', kind: 'text', recurrence: { type: 'daily' }, time: '22:00' },
    ],
  },
]
