import { expect, test, type Browser, type Page } from '@playwright/test'

/**
 * Accounts and cloud backup against the ijzer-dev Supabase project: what you log on one
 * phone appears on another, and data logged before having an account is kept.
 * Users are throw-away (e2e-…@example.com); supabase/tests/cleanup-e2e.sql removes them.
 */

const password = 'e2e-wachtwoord-123'
const uniqueEmail = (tag: string) =>
  `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`

async function newPhone(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  return context.newPage()
}

async function finishOnboarding(page: Page, name: string) {
  await expect(page).toHaveURL(/\/welkom/)
  await page.getByLabel('Naam of bijnaam').fill(name)
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Volgende' }).click()
  await page.getByRole('button', { name: 'Klaar, naar de app' }).click()
  await expect(page.getByRole('heading', { name: `Hoi ${name}` })).toBeVisible()
}

async function logWeight(page: Page, digits: string) {
  await page.getByRole('button', { name: 'Weeg je' }).click()
  const sheet = page.getByRole('dialog')
  for (const d of digits)
    await sheet.getByRole('button', { name: d === ',' ? 'Komma' : d, exact: true }).click()
  await sheet.getByRole('button', { name: 'Klaar' }).click()
}

async function waitForCloud(page: Page) {
  await page.goto('/ik')
  await expect(page.getByText('Alles opgeslagen in de cloud')).toBeVisible({ timeout: 20_000 })
}

test('what you log on one phone appears on the other', async ({ browser }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'iphone-390',
    'one run is enough: this test creates real users',
  )
  const email = uniqueEmail('sync')

  const phoneA = await newPhone(browser)
  await phoneA.goto('/')
  await phoneA.getByRole('button', { name: 'Account maken' }).click()
  await phoneA.getByLabel('E-mailadres').fill(email)
  await phoneA.getByLabel('Wachtwoord', { exact: true }).fill(password)
  await phoneA.getByRole('button', { name: 'Account maken' }).click()
  await finishOnboarding(phoneA, 'Toestel')
  await logWeight(phoneA, '80,5')
  await expect(phoneA.getByText(/80,5/).first()).toBeVisible()
  await waitForCloud(phoneA)
  await phoneA.screenshot({ path: 'test-results/screens/accounts-me-iphone-390.png' })

  const phoneB = await newPhone(browser)
  await phoneB.goto('/login')
  await phoneB.getByLabel('E-mailadres').fill(email)
  await phoneB.getByLabel('Wachtwoord', { exact: true }).fill(password)
  await phoneB.getByRole('button', { name: 'Inloggen' }).click()
  await expect(phoneB.getByRole('heading', { name: 'Hoi Toestel' })).toBeVisible({
    timeout: 20_000,
  })
  await expect(phoneB.getByText(/80,5/).first()).toBeVisible()

  // Signing out removes the data from that phone, not from the cloud.
  await phoneB.goto('/ik')
  await phoneB.getByRole('button', { name: 'Uitloggen' }).click()
  await expect(phoneB).toHaveURL(/\/$/)
})

test('data logged without an account is kept when you create one', async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'iphone-390',
    'one run is enough: this test creates real users',
  )
  const email = uniqueEmail('claim')

  const phone = await newPhone(browser)
  await phone.goto('/')
  await phone.getByRole('link', { name: 'Eerst proberen zonder account' }).click()
  await finishOnboarding(phone, 'Lokaal')
  await expect(phone.getByText('Je progressie staat alleen op deze iPhone')).toBeVisible()
  await logWeight(phone, '72')
  await phone.getByRole('button', { name: 'Account maken' }).first().click()
  await phone.getByLabel('E-mailadres').fill(email)
  await phone.getByLabel('Wachtwoord', { exact: true }).fill(password)
  await phone.getByRole('button', { name: 'Account maken' }).click()
  await expect(phone.getByRole('heading', { name: 'Gegevens op deze iPhone' })).toBeVisible()
  await phone.getByRole('button', { name: 'Bewaar ze in mijn account' }).click()
  await expect(phone.getByRole('heading', { name: 'Hoi Lokaal' })).toBeVisible()
  await waitForCloud(phone)

  const other = await newPhone(browser)
  await other.goto('/login')
  await other.getByLabel('E-mailadres').fill(email)
  await other.getByLabel('Wachtwoord', { exact: true }).fill(password)
  await other.getByRole('button', { name: 'Inloggen' }).click()
  await expect(other.getByRole('heading', { name: 'Hoi Lokaal' })).toBeVisible({ timeout: 20_000 })
  await expect(other.getByText(/^72/).first()).toBeVisible()
})

test('a wrong password shows a clear message', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone-390', 'talks to the real backend')
  await page.goto('/login')
  await page.getByLabel('E-mailadres').fill('e2e-nobody@example.com')
  await page.getByLabel('Wachtwoord', { exact: true }).fill('verkeerd-wachtwoord')
  await page.getByRole('button', { name: 'Inloggen' }).click()
  await expect(page.getByRole('alert')).toHaveText('E-mailadres of wachtwoord klopt niet.')
})
