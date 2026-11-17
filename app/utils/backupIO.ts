import type { BackupData, Photo } from '#shared/types/models'

/** Esporta tutti i dati come JSON e avvia il download. */
export async function exportBackup(includePhotos: boolean): Promise<void> {
  const db = useDb()
  const [activities, entries, inbox, tags, settings] = await Promise.all([
    db.activities.toArray(), db.entries.toArray(), db.inbox.toArray(), db.tags.toArray(), db.settings.get('preferences'),
  ])
  const photos: BackupData['photos'] = []
  if (includePhotos) {
    await db.photos.each(async (p: Photo) => {
      photos.push({
        id: p.id, type: p.type, width: p.width, height: p.height, createdAt: p.createdAt,
        data: await blobToDataUrl(p.blob), thumb: await blobToDataUrl(p.thumb),
      })
    })
  }
  const exportedEntries = includePhotos ? entries : entries.map(e => ({ ...e, photoIds: [] }))
  const backup = createBackup({ activities, entries: exportedEntries, inbox, tags, preferences: settings?.value ?? {}, photos })
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reminder-backup-${todayKey()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Legge un file di backup (v1 o v2) senza applicarlo. */
export async function readBackupFile(file: File): Promise<BackupData> {
  let json: unknown
  try {
    json = JSON.parse(await file.text())
  }
  catch {
    throw new AppError('backup.invalidJson')
  }
  return parseBackup(json)
}

/** Sostituisce tutti i dati locali con quelli del backup. */
export async function replaceAllData(data: BackupData): Promise<void> {
  const db = useDb()
  const photos: Photo[] = await Promise.all(data.photos.map(async p => ({
    id: p.id, type: p.type, width: p.width, height: p.height, createdAt: p.createdAt,
    blob: await dataUrlToBlob(p.data), thumb: await dataUrlToBlob(p.thumb),
  })))
  await db.transaction('rw', [db.activities, db.entries, db.inbox, db.tags, db.photos, db.settings], async () => {
    await Promise.all([db.activities.clear(), db.entries.clear(), db.inbox.clear(), db.tags.clear(), db.photos.clear()])
    await db.activities.bulkAdd(data.activities)
    await db.entries.bulkAdd(data.entries)
    await db.inbox.bulkAdd(data.inbox)
    await db.tags.bulkAdd(data.tags)
    await db.photos.bulkAdd(photos)
    const current = (await db.settings.get('preferences'))?.value ?? {}
    await db.settings.put({ key: 'preferences', value: { ...current, ...data.preferences, onboarded: true } })
  })
  await reloadPreferences()
}

/** Cancella tutto e riporta l'app al primo avvio. */
export async function resetAllData(): Promise<void> {
  const db = useDb()
  await db.transaction('rw', [db.activities, db.entries, db.inbox, db.tags, db.photos, db.settings], async () => {
    await Promise.all([db.activities.clear(), db.entries.clear(), db.inbox.clear(), db.tags.clear(), db.photos.clear(), db.settings.clear()])
  })
  await reloadPreferences()
}

/**
 * Primo avvio della v2 sullo stesso dispositivo della v1: se esiste il vecchio database
 * (idb-keyval, db "reminder", store "app-state"), lo converte automaticamente.
 * Restituisce true se ha importato qualcosa.
 */
export async function migrateFromV1IfPresent(): Promise<boolean> {
  if (typeof indexedDB === 'undefined' || !('databases' in indexedDB)) return false
  const FLAG = 'reminder:v1-checked'
  try {
    if (localStorage.getItem(FLAG)) return false
    localStorage.setItem(FLAG, new Date().toISOString())
  }
  catch { /* storage non disponibile: si prova comunque */ }
  const dbs = await indexedDB.databases()
  if (!dbs.some(d => d.name === 'reminder')) return false

  const raw = await new Promise<unknown>((resolve) => {
    const req = indexedDB.open('reminder')
    req.onerror = () => resolve(null)
    req.onsuccess = () => {
      const old = req.result
      if (!old.objectStoreNames.contains('app-state')) {
        old.close()
        resolve(null)
        return
      }
      const get = old.transaction('app-state', 'readonly').objectStore('app-state').get('reminder-database-v1')
      get.onsuccess = () => {
        old.close()
        resolve(get.result)
      }
      get.onerror = () => {
        old.close()
        resolve(null)
      }
    }
  })
  if (!raw) return false

  const data = convertV1(raw)
  if (!data.entries.length && !data.inbox.length && !data.activities.length) return false
  await replaceAllData(data)
  return true
}
