import type { ActivityPreset } from '#shared/utils/catalog'

/** Pacchetti iniziali con nomi, unità e scelte nella lingua corrente. */
export function usePresets() {
  const { t, te } = useI18n()

  const packs = computed(() => PRESET_PACKS.map(pack => ({
    id: pack.id,
    icon: pack.icon,
    name: t(`presets.packs.${pack.id}.name`),
    description: t(`presets.packs.${pack.id}.description`),
    activities: pack.activities.map(({ key, ...rest }): ActivityPreset => {
      const k = `presets.activities.${key}`
      return {
        ...rest,
        name: t(`${k}.name`),
        unit: te(`${k}.unit`) ? t(`${k}.unit`) : '',
        choices: te(`${k}.choices`) ? t(`${k}.choices`).split(',').map(s => s.trim()).filter(Boolean) : [],
      }
    }),
  })))

  return { packs }
}
