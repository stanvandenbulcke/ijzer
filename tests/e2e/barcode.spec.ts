import { expect, test } from '@playwright/test'

/**
 * Barcode flow against ijzer-dev: a real lookup via the food-lookup edge function (Open Food
 * Facts + shared cache), confirmed in an editable form, then found again as your own product.
 * The camera is not available in CI, so the code is typed (the same path as a scan).
 */
const email = () => `e2e-barcode-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`

test('look up a barcode, confirm the values, log it; the second scan finds your own product', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone-390', 'talks to the real backend')
  await page.goto('/registreren')
  await page.getByLabel('E-mailadres').fill(email())
  await page.getByLabel('Wachtwoord', { exact: true }).fill('e2e-wachtwoord-123')
  await page.getByRole('button', { name: 'Account maken' }).click()
  await expect(page).toHaveURL(/\/welkom/, { timeout: 15_000 })
  await page.getByLabel('Naam of bijnaam').fill('Scan')
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Volgende' }).click()
  await page.getByRole('button', { name: 'Klaar, naar de app' }).click()
  await expect(page).toHaveURL(/\/vandaag/)

  await page.goto('/voeding')
  await page.getByRole('button', { name: 'Toevoegen aan snacks' }).click()
  const sheet = page.getByRole('dialog')
  await sheet.getByRole('button', { name: 'Barcode scannen' }).click()
  await sheet.getByLabel('Of typ de code').fill('3017620422003')
  await sheet.getByRole('button', { name: 'Zoek' }).click()
  await expect(sheet.getByText(/Gevonden in Open Food Facts/)).toBeVisible({ timeout: 20_000 })
  await expect(sheet.getByLabel('Naam')).toHaveValue('Nutella')
  await expect(sheet.getByLabel('Energie (kcal)')).toHaveValue('539')
  await page.screenshot({
    path: `test-results/screens/barcode-confirm-${testInfo.project.name}.png`,
  })
  await sheet.getByRole('button', { name: 'Opslaan en kiezen' }).click()
  await sheet.getByRole('button', { name: '2', exact: true }).click()
  await sheet.getByRole('button', { name: '0', exact: true }).click()
  await sheet.getByRole('button', { name: 'Klaar' }).click()
  await expect(page.getByRole('button', { name: /^Nutella/ })).toContainText('108')

  // Scanning the same code again goes straight to the portion: it is your own product now.
  await page.getByRole('button', { name: 'Toevoegen aan snacks' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Barcode scannen' }).click()
  await page.getByRole('dialog').getByLabel('Of typ de code').fill('3017620422003')
  await page.getByRole('dialog').getByRole('button', { name: 'Zoek' }).click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Nutella' })).toBeVisible()
})
