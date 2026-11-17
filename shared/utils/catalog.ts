import type { Activity, ActivityColor, ValueKind } from '../types/models'

/** Icone selezionabili per le attività (incluse nel bundle: vedi nuxt.config). */
export const ACTIVITY_ICONS = [
  'i-lucide-circle-check', 'i-lucide-droplet', 'i-lucide-glass-water', 'i-lucide-coffee', 'i-lucide-apple',
  'i-lucide-salad', 'i-lucide-utensils', 'i-lucide-pill', 'i-lucide-heart-pulse', 'i-lucide-bed',
  'i-lucide-moon', 'i-lucide-sun', 'i-lucide-smile', 'i-lucide-brain', 'i-lucide-flower-2',
  'i-lucide-footprints', 'i-lucide-bike', 'i-lucide-dumbbell', 'i-lucide-activity', 'i-lucide-scale',
  'i-lucide-book-open', 'i-lucide-graduation-cap', 'i-lucide-languages', 'i-lucide-pen-line', 'i-lucide-notebook-pen',
  'i-lucide-laptop', 'i-lucide-briefcase', 'i-lucide-mail', 'i-lucide-phone', 'i-lucide-users',
  'i-lucide-house', 'i-lucide-spray-can', 'i-lucide-washing-machine', 'i-lucide-shopping-cart', 'i-lucide-trash-2',
  'i-lucide-sprout', 'i-lucide-dog', 'i-lucide-cat', 'i-lucide-baby', 'i-lucide-car',
  'i-lucide-wallet', 'i-lucide-piggy-bank', 'i-lucide-receipt', 'i-lucide-music', 'i-lucide-guitar',
  'i-lucide-palette', 'i-lucide-camera', 'i-lucide-gamepad-2', 'i-lucide-tv', 'i-lucide-smartphone',
  'i-lucide-cigarette-off', 'i-lucide-wine-off', 'i-lucide-timer', 'i-lucide-star', 'i-lucide-flame',
  'i-lucide-target', 'i-lucide-repeat', 'i-lucide-calendar-check', 'i-lucide-sparkles', 'i-lucide-leaf',
] as const

export const ACTIVITY_COLORS: Record<ActivityColor, string> = {
  teal: '#14b8a6',
  emerald: '#10b981',
  lime: '#84cc16',
  amber: '#f59e0b',
  orange: '#f97316',
  rose: '#f43f5e',
  fuchsia: '#d946ef',
  violet: '#8b5cf6',
  indigo: '#6366f1',
  sky: '#0ea5e9',
  cyan: '#06b6d4',
  stone: '#78716c',
}

export const KIND_INFO: Record<ValueKind, { label: string, hint: string, icon: string }> = {
  check: { label: 'Fatto / non fatto', hint: 'Un tap per segnarla', icon: 'i-lucide-square-check' },
  counter: { label: 'Contatore', hint: 'Bicchieri d\'acqua, pause, sigarette…', icon: 'i-lucide-plus' },
  number: { label: 'Numero', hint: 'Km, €, kg, pagine…', icon: 'i-lucide-hash' },
  duration: { label: 'Durata', hint: 'Sonno, lettura, studio…', icon: 'i-lucide-timer' },
  scale: { label: 'Scala', hint: 'Umore, energia, dolore…', icon: 'i-lucide-gauge' },
  choice: { label: 'Scelta', hint: 'Tipo di allenamento, pasto…', icon: 'i-lucide-list' },
  text: { label: 'Testo', hint: 'Una riga di diario guidato', icon: 'i-lucide-text' },
}

export const MOOD_LABELS = ['😞', '😕', '😐', '🙂', '😄']

export type ActivityPreset = Omit<Activity, 'id' | 'order' | 'archived' | 'createdAt' | 'updatedAt' | 'startDate' | 'tagIds'>

const base = {
  unit: '', goal: null, step: 1, scaleLabels: [] as string[], choices: [] as string[], time: null,
}

export interface PresetPack {
  id: string
  name: string
  description: string
  icon: string
  activities: ActivityPreset[]
}

export const PRESET_PACKS: PresetPack[] = [
  {
    id: 'benessere',
    name: 'Benessere',
    description: 'Acqua, movimento, sonno e umore',
    icon: 'i-lucide-heart-pulse',
    activities: [
      { ...base, name: 'Acqua', icon: 'i-lucide-glass-water', color: 'sky', kind: 'counter', unit: 'bicchieri', goal: { op: 'gte', target: 8 }, recurrence: { type: 'daily' } },
      { ...base, name: 'Passi o camminata', icon: 'i-lucide-footprints', color: 'emerald', kind: 'duration', goal: { op: 'gte', target: 30 }, recurrence: { type: 'daily' } },
      { ...base, name: 'Allenamento', icon: 'i-lucide-dumbbell', color: 'orange', kind: 'choice', choices: ['Corsa', 'Palestra', 'Bici', 'Yoga'], recurrence: { type: 'weekly', times: 3 } },
      { ...base, name: 'Sonno', icon: 'i-lucide-bed', color: 'indigo', kind: 'duration', goal: { op: 'gte', target: 420 }, recurrence: { type: 'daily' }, time: '08:00' },
      { ...base, name: 'Umore', icon: 'i-lucide-smile', color: 'amber', kind: 'scale', scaleLabels: MOOD_LABELS, recurrence: { type: 'daily' }, time: '21:00' },
    ],
  },
  {
    id: 'casa',
    name: 'Casa',
    description: 'Faccende, spesa e piante',
    icon: 'i-lucide-house',
    activities: [
      { ...base, name: 'Lavatrice', icon: 'i-lucide-washing-machine', color: 'cyan', kind: 'check', recurrence: { type: 'weekdays', days: [1, 4] } },
      { ...base, name: 'Innaffiare le piante', icon: 'i-lucide-sprout', color: 'lime', kind: 'check', recurrence: { type: 'interval', every: 3 } },
      { ...base, name: 'Spesa', icon: 'i-lucide-shopping-cart', color: 'rose', kind: 'number', unit: '€', recurrence: { type: 'none' } },
      { ...base, name: 'Pulizie', icon: 'i-lucide-spray-can', color: 'violet', kind: 'check', recurrence: { type: 'weekdays', days: [6] } },
      { ...base, name: 'Bollette', icon: 'i-lucide-receipt', color: 'stone', kind: 'check', recurrence: { type: 'monthly', day: 1 } },
    ],
  },
  {
    id: 'studio',
    name: 'Studio e lavoro',
    description: 'Concentrazione, lettura e cose imparate',
    icon: 'i-lucide-graduation-cap',
    activities: [
      { ...base, name: 'Lavoro concentrato', icon: 'i-lucide-target', color: 'teal', kind: 'duration', goal: { op: 'gte', target: 120 }, recurrence: { type: 'weekdays', days: [1, 2, 3, 4, 5] } },
      { ...base, name: 'Lettura', icon: 'i-lucide-book-open', color: 'amber', kind: 'number', unit: 'pagine', goal: { op: 'gte', target: 20 }, recurrence: { type: 'daily' } },
      { ...base, name: 'Lingua straniera', icon: 'i-lucide-languages', color: 'fuchsia', kind: 'check', recurrence: { type: 'weekly', times: 4 } },
      { ...base, name: 'Cosa ho imparato', icon: 'i-lucide-pen-line', color: 'sky', kind: 'text', recurrence: { type: 'daily' }, time: '22:00' },
    ],
  },
]
