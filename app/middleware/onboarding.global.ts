export default defineNuxtRouteMiddleware(async (to) => {
  await loadPreferences()
  const { prefs } = usePreferences()
  if (prefs.value.onboarded || to.path === '/benvenuto') return

  // stesso dispositivo della vecchia app: porta i dati con sé, senza chiedere nulla
  if (await migrateFromV1IfPresent()) {
    useToast().add({
      title: useNuxtApp().$i18n.t('toast.migrated'),
      description: useNuxtApp().$i18n.t('toast.migratedDescription'),
      icon: 'i-lucide-sparkles',
      color: 'success',
      duration: 8000,
    })
    return
  }
  return navigateTo('/benvenuto')
})
