import { expect, test } from '@playwright/test'

test('landing placeholder renders and is installable', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'IJZER' })).toBeVisible()

  // PWA basics: manifest is linked and served.
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(manifestHref).toBeTruthy()
  const manifest = await (await page.request.get(manifestHref!)).json()
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThan(0)

  // No horizontal scroll on iPhone widths.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)

  for (const theme of ['dark', 'light'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
    await page.screenshot({
      path: `test-results/screens/landing-${testInfo.project.name}-${theme}.png`,
      fullPage: true,
    })
  }
})

test('unknown route shows the designed not-found page', async ({ page }) => {
  await page.goto('/bestaat-niet')
  await expect(page.getByRole('heading', { name: 'Deze pagina bestaat niet' })).toBeVisible()
  await page.getByRole('link', { name: 'Terug naar start' }).click()
  await expect(page).toHaveURL('/')
})
