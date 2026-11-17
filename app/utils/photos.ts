import type { Photo } from '#shared/types/models'

const MAX_SIDE = 1600
const THUMB_SIDE = 360

async function loadBitmap(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    }
    catch { /* fallback sotto */ }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  }
  finally {
    URL.revokeObjectURL(url)
  }
}

async function resize(source: ImageBitmap | HTMLImageElement, maxSide: number, quality: number): Promise<{ blob: Blob, width: number, height: number }> {
  const w0 = source.width
  const h0 = source.height
  const ratio = Math.min(1, maxSide / Math.max(w0, h0))
  const width = Math.round(w0 * ratio)
  const height = Math.round(h0 * ratio)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(source, 0, 0, width, height)
  const toBlob = (type: string) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality))
  const blob = (await toBlob('image/webp')) ?? (await toBlob('image/jpeg'))
  if (!blob) throw new AppError('photo.processFailed')
  return { blob, width, height }
}

/** Ridimensiona, comprime e salva una foto; restituisce l'id. */
export async function savePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new AppError('photo.notImage')
  const bitmap = await loadBitmap(file)
  const full = await resize(bitmap, MAX_SIDE, 0.82)
  const thumb = await resize(bitmap, THUMB_SIDE, 0.7)
  if ('close' in bitmap) bitmap.close()
  const photo: Photo = {
    id: newId('pho'),
    blob: full.blob,
    thumb: thumb.blob,
    type: full.blob.type,
    width: full.width,
    height: full.height,
    createdAt: new Date().toISOString(),
  }
  await useDb().photos.add(photo)
  return photo.id
}

const urlCache = new Map<string, string>()

/** URL oggetto (in cache) della foto o della miniatura. */
export async function photoUrl(id: string, kind: 'thumb' | 'full' = 'thumb'): Promise<string | null> {
  const key = `${id}:${kind}`
  const cached = urlCache.get(key)
  if (cached) return cached
  const photo = await useDb().photos.get(id)
  if (!photo) return null
  const url = URL.createObjectURL(kind === 'thumb' ? photo.thumb : photo.blob)
  urlCache.set(key, url)
  return url
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob()
}
