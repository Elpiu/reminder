import type { Activity, DateKey, EntryValue, Recurrence, ValueKind } from '#shared/types/models'

/**
 * Formattazioni che dipendono dalla lingua scelta: titoli dei giorni, date, valori,
 * ricorrenze, tipi di valore, colori e categorie di icone.
 */
export function useFmt() {
  const { t, locale, locales } = useI18n()

  const intl = computed(() => {
    const found = locales.value.find(l => typeof l !== 'string' && l.code === locale.value)
    return (typeof found === 'object' && found.language) || locale.value
  })

  const dayTitle = (key: DateKey) => formatDayTitle(key, intl.value, {
    today: t('common.today'),
    yesterday: t('common.yesterday'),
    tomorrow: t('common.tomorrow'),
  })

  const longDate = (key: DateKey) => formatLongDate(key, intl.value)
  const shortDate = (key: DateKey) => formatShortDate(key, intl.value)
  const monthTitle = (year: number, month: number) => formatMonthTitle(year, month, intl.value)
  const weekdayNarrow = (key: DateKey) => formatWeekdayNarrow(key, intl.value)
  const monthShort = (key: DateKey) => formatMonthShort(key, intl.value)

  const value = (a: Pick<Activity, 'kind' | 'unit' | 'scaleLabels'>, v: EntryValue) =>
    formatValue(a, v, intl.value, t('common.done'))

  const weekdayShort = (iso: number) => t(`weekdays.short.${iso}`)

  const recurrence = (rec: Recurrence): string => {
    switch (rec.type) {
      case 'none':
        return t('recurrence.none')
      case 'daily':
        return t('recurrence.daily')
      case 'weekdays': {
        const d = [...rec.days].sort()
        if (d.length === 7) return t('recurrence.daily')
        if (d.length === 5 && [1, 2, 3, 4, 5].every(x => d.includes(x))) return t('recurrence.workdays')
        if (d.length === 2 && d.includes(6) && d.includes(7)) return t('recurrence.weekend')
        return d.map(weekdayShort).join(', ')
      }
      case 'interval':
        return rec.every === 1 ? t('recurrence.daily') : t('recurrence.interval', { n: rec.every })
      case 'weekly':
        return t('recurrence.weekly', { n: rec.times }, rec.times)
      case 'monthly':
        return t('recurrence.monthly', { day: rec.day })
    }
  }

  const kindLabel = (k: ValueKind) => t(`kinds.${k}.label`)
  const kindHint = (k: ValueKind) => t(`kinds.${k}.hint`)

  const colorLabel = (s: { hue: string, dark: boolean }) =>
    s.dark ? t('colors.dark', { color: t(`colors.${s.hue}`) }) : t(`colors.${s.hue}`)

  const streakUnit = (unit: 'days' | 'weeks', n: number) => t(`stats.unit.${unit}`, n)

  /** Messaggio leggibile per un errore (codici AppError tradotti, altrimenti il testo originale). */
  const error = (err: unknown): string => {
    if (err instanceof AppError) {
      const params = { ...err.params }
      if (params.kind) params.kind = t(`errors.kinds.${params.kind}`)
      return t(`errors.${err.code}`, params)
    }
    return err instanceof Error ? err.message : String(err)
  }

  return {
    t, locale, intl, dayTitle, longDate, shortDate, monthTitle, weekdayNarrow, monthShort,
    value, recurrence, kindLabel, kindHint, colorLabel, streakUnit, error, weekdayShort,
  }
}
