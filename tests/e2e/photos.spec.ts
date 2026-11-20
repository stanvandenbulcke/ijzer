import { expect, test } from '@playwright/test'

/** Progress photos stay on the device and play as a timelapse (Stan's idea #4). */

// Two tiny valid PNGs (2×2 px) in different colours.
const PNG_A =
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGP4dNAPiBggFAA6uggFSqgFyQAAAABJRU5ErkJggg=='
const PNG_B =
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGPQz78HRAwQCgAm4gXxNvGU4gAAAABJRU5ErkJggg=='

test('add two photos, play the timelapse, delete with undo', async ({ page }, testInfo) => {
  await page.goto('/welkom')
  await page.getByLabel('Naam of bijnaam').fill('Stan')
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Volgende' }).click()
  await page.getByRole('button', { name: 'Klaar, naar de app' }).click()
  await expect(page).toHaveURL(/\/vandaag/)
  await page.goto('/progressie/lichaam')

  // Every request must stay local: photos are never uploaded.
  const external: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost') && !r.url().startsWith('blob:'))
      external.push(r.url())
  })

  await page.getByLabel('Foto toevoegen').setInputFiles([
    { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from(PNG_A, 'base64') },
    { name: 'b.png', mimeType: 'image/png', buffer: Buffer.from(PNG_B, 'base64') },
  ])
  await expect(page.getByRole('button', { name: /^Foto van/ })).toHaveCount(2)
  await page.getByRole('button', { name: 'Timelapse afspelen' }).click()
  await expect(page.getByRole('dialog', { name: 'Timelapse' })).toBeVisible()
  await page.screenshot({
    path: `test-results/screens/photos-timelapse-${testInfo.project.name}.png`,
  })
  await page.getByRole('button', { name: 'Sluiten' }).click()

  await page
    .getByRole('button', { name: /^Foto van/ })
    .first()
    .click()
  await page.getByRole('button', { name: 'Verwijder foto' }).click()
  await expect(page.getByRole('button', { name: /^Foto van/ })).toHaveCount(1)
  await page.getByRole('button', { name: 'Ongedaan maken' }).click()
  await expect(page.getByRole('button', { name: /^Foto van/ })).toHaveCount(2)
  expect(external).toEqual([])
})
