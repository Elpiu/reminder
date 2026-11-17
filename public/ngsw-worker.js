// Service worker "di sicurezza" per chi aveva installato la vecchia app Angular.
// Il browser, controllando gli aggiornamenti del vecchio ngsw-worker.js, scarica questo file:
// cancella le cache di Angular, si disinstalla e ricarica le pagine aperte, che così
// caricano la nuova app (che registra il proprio sw.js). I dati in IndexedDB non vengono toccati.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k.startsWith('ngsw:')).map(k => caches.delete(k)))
    await self.registration.unregister()
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach(client => client.navigate(client.url))
  })())
})
