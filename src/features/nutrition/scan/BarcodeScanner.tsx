import { useEffect, useRef, useState } from 'react'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'

const s = t.nutrition.scan

/**
 * Camera barcode reader (EAN/UPC) with ZXing, loaded only when opened. The video never leaves
 * the phone; only the digits are used. A typed code works as a fallback.
 */
export function BarcodeScanner({ onCode }: { onCode: (code: string) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const [typed, setTyped] = useState('')
  const done = useRef(false)

  useEffect(() => {
    let stop: (() => void) | undefined
    let cancelled = false
    void (async () => {
      try {
        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all(
          [import('@zxing/browser'), import('@zxing/library')],
        )
        const hints = new Map([
          [
            DecodeHintType.POSSIBLE_FORMATS,
            [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E],
          ],
        ])
        const reader = new BrowserMultiFormatReader(hints)
        if (cancelled || !video.current) return
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } }, audio: false },
          video.current,
          (result) => {
            if (result && !done.current) {
              done.current = true
              navigator.vibrate?.(30)
              onCode(result.getText())
            }
          },
        )
        stop = () => controls.stop()
        if (cancelled) stop()
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
      stop?.()
    }
  }, [onCode])

  return (
    <div className="flex flex-col gap-3">
      {failed ? (
        <p role="alert" className="rounded-md border border-accent-edge p-3 text-sm">
          {s.noCamera}
        </p>
      ) : (
        <div className="relative overflow-hidden rounded-md bg-surface-2">
          <video ref={video} className="aspect-[4/3] w-full object-cover" muted playsInline />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-plate-red"
          />
        </div>
      )}
      <p className="text-sm text-muted">{s.hint}</p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const code = typed.replace(/\D/g, '')
          if (code.length >= 8) onCode(code)
        }}
      >
        <input
          inputMode="numeric"
          aria-label={s.typeCode}
          placeholder={s.typeCode}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="min-h-12 min-w-0 flex-1 rounded-sm border border-line-strong bg-surface px-3 outline-none placeholder:text-muted focus:border-focus"
        />
        <Button type="submit" variant="secondary">
          {s.search}
        </Button>
      </form>
    </div>
  )
}
