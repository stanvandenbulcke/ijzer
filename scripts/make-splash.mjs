/* global document */
// Generates iOS launch screens ("apple-touch-startup-image") for every current iPhone size,
// in the app's own style, plus the matching <link> tags for index.html.
// Usage: npm run splash
import { chromium } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

// [css width, css height, device pixel ratio] — portrait.
const DEVICES = [
  [440, 956, 3], // 16/17 Pro Max
  [430, 932, 3], // 14/15 Pro Max, 15/16 Plus
  [428, 926, 3], // 12/13 Pro Max, 14 Plus
  [420, 912, 3], // Air
  [414, 896, 3], // XS Max, 11 Pro Max
  [414, 896, 2], // XR, 11
  [414, 736, 3], // 6/7/8 Plus
  [402, 874, 3], // 16/17 Pro, 17
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [390, 844, 3], // 12, 13, 14
  [375, 812, 3], // X, XS, 11 Pro, 12/13 mini
  [375, 667, 2], // SE 2/3, 6/7/8
]

// The font is embedded as data: a page made with setContent cannot load local files.
const font = (
  await readFile(
    new URL(
      '../node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-900-normal.woff2',
      import.meta.url,
    ),
  )
).toString('base64')

const html = (w, h) => `<!doctype html><html><head><style>
@font-face{font-family:'BSD';font-weight:900;src:url(data:font/woff2;base64,${font}) format('woff2')}
html,body{margin:0;width:${w}px;height:${h}px;background:#111110;overflow:hidden}
.k{position:absolute;inset:0 0 auto 0;height:42%;opacity:.04;background-image:repeating-linear-gradient(45deg,#f2efe6 0 1px,transparent 1px 6px),repeating-linear-gradient(-45deg,#f2efe6 0 1px,transparent 1px 6px)}
.c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(w * 0.05)}px}
h1{margin:0;font:900 ${Math.round(w * 0.3)}px/0.8 'BSD';color:#f2efe6;letter-spacing:-1px}
.p{display:flex;gap:4px;align-items:center}.p span{display:block;width:${Math.round(w * 0.035)}px;border-radius:3px}
</style></head><body><div class="k"></div><div class="c"><h1>IRON</h1><div class="p">
<span style="height:${Math.round(w * 0.2)}px;background:#d7263d"></span><span style="height:${Math.round(w * 0.18)}px;background:#2f6fde"></span>
<span style="height:${Math.round(w * 0.16)}px;background:#f2c14e"></span><span style="height:${Math.round(w * 0.14)}px;background:#2ba84a"></span>
</div></div></body></html>`

await mkdir(new URL('../public/splash/', import.meta.url), { recursive: true })
const browser = await chromium.launch()
const links = []
for (const [w, h, dpr] of DEVICES) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr })
  await page.setContent(html(w, h))
  await page.evaluate(async () => {
    await document.fonts.load("900 100px 'BSD'")
    await document.fonts.ready
  })
  const name = `splash-${w * dpr}x${h * dpr}.png`
  await page.screenshot({ path: new URL(`../public/splash/${name}`, import.meta.url).pathname })
  await page.close()
  links.push(
    `    <link rel="apple-touch-startup-image" href="/splash/${name}" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)" />`,
  )
}
await browser.close()
await writeFile(new URL('../public/splash/links.html', import.meta.url), links.join('\n') + '\n')
console.log(`${DEVICES.length} launch screens written`)
