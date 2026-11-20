import { useEffect, useMemo } from 'react'
import type { PhotoRow } from '../../../data/db'

/** Object URLs for photo blobs, revoked again when the list changes or the screen closes. */
export function useObjectUrls(photos: PhotoRow[] | undefined): Map<string, string> {
  const urls = useMemo(
    () => new Map((photos ?? []).map((p) => [p.id, URL.createObjectURL(p.blob)])),
    [photos],
  )
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls])
  return urls
}
