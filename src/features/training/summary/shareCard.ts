import { downloadBlob } from '../../../ui/download'

/**
 * Share image after a workout (SPEC §4.4): drawn on a canvas in our own style, shared via
 * the Web Share API. Nothing is ever shared automatically.
 */
export interface ShareCardData {
  appName: string
  title: string
  date: string
  stats: Array<{ label: string; value: string }>
  prLine: string | null
}

const PLATES = ['#d7263d', '#2f6fde', '#f2c14e', '#2ba84a']

export async function renderShareCard(data: ShareCardData): Promise<Blob | null> {
  await document.fonts.ready
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#111110'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // Knurling in the header.
  ctx.strokeStyle = 'rgba(242,239,230,0.05)'
  for (let x = -400; x < 1500; x += 14) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + 400, 400)
    ctx.moveTo(x + 400, 0)
    ctx.lineTo(x, 400)
    ctx.stroke()
  }
  ctx.fillStyle = '#f2efe6'
  ctx.font = '900 150px "Big Shoulders Display", sans-serif'
  ctx.fillText(data.appName.toUpperCase(), 80, 200)
  ctx.fillStyle = '#f2c14e'
  ctx.font = '700 84px "Big Shoulders Display", sans-serif'
  ctx.fillText(data.title.toUpperCase().slice(0, 22), 80, 330)
  ctx.fillStyle = '#a8a496'
  ctx.font = '500 40px "Archivo Variable", sans-serif'
  ctx.fillText(data.date, 80, 400)

  data.stats.forEach((stat, i) => {
    const y = 560 + i * 170
    ctx.fillStyle = '#2e2e29'
    ctx.fillRect(80, y - 110, 920, 2)
    ctx.fillStyle = '#a8a496'
    ctx.font = '600 34px "Archivo Variable", sans-serif'
    ctx.fillText(stat.label.toUpperCase(), 80, y - 50)
    ctx.fillStyle = '#f2efe6'
    ctx.font = '900 110px "Big Shoulders Display", sans-serif'
    ctx.fillText(stat.value, 80, y + 50)
  })

  if (data.prLine) {
    ctx.fillStyle = '#d7263d'
    ctx.fillRect(80, 1110, 120, 64)
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 48px "Big Shoulders Display", sans-serif'
    ctx.fillText('PR', 112, 1160)
    ctx.fillStyle = '#f2efe6'
    ctx.font = '600 40px "Archivo Variable", sans-serif'
    ctx.fillText(data.prLine.slice(0, 40), 230, 1157)
  }
  // Plate stripe at the bottom.
  PLATES.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.fillRect(80 + i * 60, 1230, 44, 60)
  })

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

/** Opens the share sheet (WhatsApp, Instagram…) or downloads the image as fallback. */
export async function shareImage(blob: Blob, filename: string, title: string): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return
    } catch {
      return // cancelled by the user
    }
  }
  downloadBlob(blob, filename)
}
