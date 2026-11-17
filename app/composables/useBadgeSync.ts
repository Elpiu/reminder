/**
 * Mantiene il badge sull'icona dell'app installata con il numero di cose da fare oggi
 * e, se abilitato, mostra una notifica locale all'apertura.
 * Senza server non si possono programmare notifiche ad app chiusa: questo è il massimo affidabile.
 */
export function useBadgeSync() {
  const { prefs, loaded } = usePreferences()
  const { count, refreshDay } = usePendingToday()
  let notified = false
  const base = useRuntimeConfig().app.baseURL

  const nav = typeof navigator !== 'undefined'
    ? (navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>, clearAppBadge?: () => Promise<void> })
    : undefined

  watch([count, () => prefs.value.badge, loaded], async ([n, enabled, isLoaded]) => {
    if (!isLoaded || !nav?.setAppBadge) return
    try {
      if (enabled && n > 0) await nav.setAppBadge(n)
      else await nav.clearAppBadge?.()
    }
    catch { /* non supportato su questo dispositivo */ }
  })

  const maybeNotify = async () => {
    if (notified || !prefs.value.notifyOnOpen || count.value === 0) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    notified = true
    const body = count.value === 1 ? 'Hai 1 cosa da fare oggi.' : `Hai ${count.value} cose da fare oggi.`
    try {
      const reg = await navigator.serviceWorker?.getRegistration()
      if (reg) await reg.showNotification('Reminder', { body, icon: `${base}pwa-192x192.png`, badge: `${base}pwa-64x64.png`, tag: 'today' })
      else new Notification('Reminder', { body, tag: 'today' })
    }
    catch { /* ignorato */ }
  }

  if (typeof document !== 'undefined') {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshDay()
        notified = false
        setTimeout(maybeNotify, 1500)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    onScopeDispose(() => document.removeEventListener('visibilitychange', onVisible))
    watch(loaded, (l) => {
      if (l) setTimeout(maybeNotify, 1500)
    }, { immediate: true })
  }
}
