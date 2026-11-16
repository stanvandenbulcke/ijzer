// Renders public/icon.svg to the PNG sizes the PWA manifest and iOS need.
// Usage: npm run icons   (temporary icon; the final one comes in phase 9)
import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const svg = await readFile(new URL('../public/icon.svg', import.meta.url), 'utf8')
const targets = [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['apple-touch-icon.png', 180],
]
const browser = await chromium.launch()
for (const [name, size] of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  )
  await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname })
  await page.close()
}
await browser.close()
console.log('icons written')
