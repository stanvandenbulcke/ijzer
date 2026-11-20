import { useLiveQuery } from 'dexie-react-hooks'
import { localDay } from '../domain/time'
import { db, type PhotoRow } from './db'
import { newId, now } from './rows'

/** Longest side of a stored photo: sharp on an iPhone screen, small enough for many photos. */
const MAX_SIDE = 1280

/** All progress photos, oldest first (timelapse order). */
export const usePhotos = () =>
  useLiveQuery(async () =>
    (await db.photos.toArray()).sort(
      (a, b) => a.day.localeCompare(b.day) || a.createdAt.localeCompare(b.createdAt),
    ),
  )

async function downscale(file: Blob): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  const factor = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * factor)
  const height = Math.round(bitmap.height * factor)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.85),
  )
  return { blob: blob ?? file, width, height }
}

/**
 * Adds a photo from the camera or the photo library. The day is when the photo was taken
 * (file date), so older photos land in the right place in the timelapse.
 */
export async function addPhoto(file: File): Promise<void> {
  const { blob, width, height } = await downscale(file)
  await db.photos.put({
    id: newId(),
    day: localDay(new Date(file.lastModified || Date.now())),
    blob,
    width,
    height,
    createdAt: now(),
  })
}

export async function deletePhoto(id: string): Promise<PhotoRow | undefined> {
  const row = await db.photos.get(id)
  await db.photos.delete(id)
  return row
}

export async function restorePhoto(row: PhotoRow): Promise<void> {
  await db.photos.put(row)
}
