export default defineNuxtRouteMiddleware(async (to) => {
  await loadPreferences()
  const { prefs } = usePreferences()
  if (prefs.value.onboarded || to.path === '/benvenuto') return

  // stesso dispositivo della vecchia app: porta i dati con sé, senza chiedere nulla
  if (await migrateFromV1IfPresent()) {
    useToast().add({
      title: 'Dati della versione precedente importati',
      description: 'Note, todo e ricorrenti sono ora voci, inbox e attività.',
      icon: 'i-lucide-sparkles',
      color: 'success',
      duration: 8000,
    })
    return
  }
  return navigateTo('/benvenuto')
})
