import { Camera, Download, Film, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { PhotoRow } from '../../../data/db'
import { addPhoto, deletePhoto, restorePhoto, usePhotos } from '../../../data/photosRepo'
import { t } from '../../../i18n'
import { formatDayLong, formatDayShort } from '../../../i18n/format'
import { Button } from '../../../ui/Button'
import { Sheet } from '../../../ui/Sheet'
import { useToast } from '../../../ui/toast/toastContext'
import { downloadBlob } from '../../../ui/download'
import { Section } from '../Section'
import { Timelapse } from './Timelapse'
import { useObjectUrls } from './useObjectUrls'

const p = t.progress.photos

/**
 * Progress photos, kept ONLY on this iPhone (never uploaded), with a timelapse player.
 * Same light and pose every time makes the timelapse honest.
 */
export function ProgressPhotos() {
  const toast = useToast()
  const photos = usePhotos()
  const urls = useObjectUrls(photos)
  const [open, setOpen] = useState<PhotoRow | null>(null)
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!photos) return null

  const add = async (files: File[]) => {
    if (!files.length) return
    setBusy(true)
    try {
      for (const file of files) await addPhoto(file)
    } catch {
      toast({ message: p.failed })
    }
    setBusy(false)
  }

  return (
    <Section title={p.title} note={p.note}>
      <div className="flex flex-col gap-3">
        <label className="press flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-accent-edge bg-plate-yellow px-5 font-display text-xl font-bold text-on-accent uppercase">
          <Camera aria-hidden size={22} />
          {busy ? p.adding : p.add}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              // Copy first: clearing the input empties its live FileList.
              void add(Array.from(e.target.files ?? []))
              e.target.value = ''
            }}
          />
        </label>
        {photos.length >= 2 && (
          <Button variant="secondary" icon={Film} block onClick={() => setPlaying(true)}>
            {p.play}
          </Button>
        )}
        {photos.length === 0 ? (
          <p className="text-sm text-muted">{p.empty}</p>
        ) : (
          <ul className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => setOpen(photo)}
                  className="press relative block aspect-[3/4] w-full overflow-hidden rounded-sm bg-surface-2"
                  aria-label={p.photoOf(formatDayLong(photo.day))}
                >
                  <img
                    src={urls.get(photo.id)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-scrim px-1.5 py-0.5 text-left text-xs font-semibold text-text">
                    {formatDayShort(photo.day)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted">{p.privacy}</p>
      </div>

      <Sheet
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open ? formatDayLong(open.day) : ''}
      >
        {open && (
          <div className="flex flex-col gap-3">
            <img
              src={urls.get(open.id)}
              alt={p.photoOf(formatDayLong(open.day))}
              className="max-h-[55dvh] w-full rounded-md object-contain"
            />
            <Button
              variant="secondary"
              icon={Download}
              block
              onClick={() => downloadBlob(open.blob, `iron-foto-${open.day}.jpg`)}
            >
              {p.save}
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              block
              onClick={async () => {
                const row = await deletePhoto(open.id)
                setOpen(null)
                if (row)
                  toast({
                    message: p.deleted,
                    action: { label: t.nutrition.undo, onAction: () => void restorePhoto(row) },
                  })
              }}
            >
              {p.delete}
            </Button>
          </div>
        )}
      </Sheet>
      {playing && <Timelapse photos={photos} urls={urls} onClose={() => setPlaying(false)} />}
    </Section>
  )
}
