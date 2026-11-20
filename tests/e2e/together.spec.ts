import { expect, test, type Browser, type Page } from '@playwright/test'

/**
 * Samen trainen against ijzer-dev: two phones link with a one-time code, then one trains and
 * the other sees the exercise, kg and reps appear live.
 */
const password = 'e2e-wachtwoord-123'
const email = (tag: string) =>
  `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`

async function phoneWithAccount(browser: Browser, name: string): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  await page.goto('/registreren')
  await page.getByLabel('E-mailadres').fill(email(name.toLowerCase()))
  await page.getByLabel('Wachtwoord', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Account maken' }).click()
  await expect(page).toHaveURL(/\/welkom/, { timeout: 15_000 })
  await page.getByLabel('Naam of bijnaam').fill(name)
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Volgende' }).click()
  await page.getByRole('button', { name: 'Klaar, naar de app' }).click()
  await expect(page).toHaveURL(/\/vandaag/)
  // Wait until the profile (with the name) is in the cloud: the buddy link copies the name.
  await page.goto('/ik')
  await expect(page.getByText('Alles opgeslagen in de cloud')).toBeVisible({ timeout: 15_000 })
  return page
}

test('link with a code and follow the other workout live', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone-390', 'one run is enough: creates real users')
  test.setTimeout(90_000)
  const stan = await phoneWithAccount(browser, 'Stan')
  const lotte = await phoneWithAccount(browser, 'Lotte')

  await stan.goto('/train/samen')
  await stan.getByRole('button', { name: 'Maak een code' }).click()
  const code = (await stan.locator('p.tracking-\\[0\\.2em\\]').textContent())?.trim() ?? ''
  expect(code).toMatch(/^[A-Z0-9]{6}$/)

  await lotte.goto('/train/samen')
  await lotte.getByLabel('Code van 6 tekens').fill(code)
  await lotte.getByRole('button', { name: 'Koppel', exact: true }).click()
  await expect(lotte.getByText('Gekoppeld met Stan')).toBeVisible()
  await expect(lotte.getByText('Stan traint nu niet')).toBeVisible()

  await stan.reload()
  await expect(stan.getByText('Lotte traint nu niet')).toBeVisible({ timeout: 15_000 })

  // Lotte trains: a free workout, one set of hip thrusts.
  await lotte.goto('/train')
  await lotte.getByRole('button', { name: /Vrije training/ }).click()
  await lotte.getByRole('button', { name: 'Oefening toevoegen' }).first().click()
  await lotte.getByRole('dialog').getByRole('searchbox').fill('billen')
  await lotte
    .getByRole('dialog')
    .getByRole('button', { name: /^Barbell Hip Thrust/ })
    .first()
    .click()
  await lotte.getByRole('button', { name: 'Set 1 afvinken' }).first().click()
  for (const d of '60')
    await lotte.getByRole('dialog').getByRole('button', { name: d, exact: true }).click()
  await lotte.getByRole('dialog').getByRole('button', { name: 'Klaar' }).click()
  for (const d of '8')
    await lotte.getByRole('dialog').getByRole('button', { name: d, exact: true }).click()
  await lotte.getByRole('dialog').getByRole('button', { name: 'Klaar' }).click()

  await expect(stan.getByText('Lotte traint nu')).toBeVisible({ timeout: 15_000 })
  await expect(stan.getByText('60 kg × 8')).toBeVisible({ timeout: 15_000 })
  await stan.screenshot({
    path: 'test-results/screens/together-live-iphone-390.png',
    fullPage: true,
  })
})
