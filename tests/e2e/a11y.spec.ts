import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/** Every tab and the workout screen pass an automated WCAG A/AA scan, in both themes. */

async function onboard(page: Page) {
  await page.goto('/welkom')
  await page.getByLabel('Naam of bijnaam').fill('Stan')
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Volgende' }).click()
  await page.getByRole('button', { name: 'Klaar, naar de app' }).click()
  await expect(page).toHaveURL(/\/vandaag/)
}

async function scan(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  return results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )
}

const PAGES = [
  '/vandaag',
  '/train',
  '/train/oefeningen',
  '/train/routine/nieuw',
  '/voeding',
  '/progressie/lichaam',
  '/progressie/analyse',
  '/ik',
]

for (const theme of ['dark', 'light'] as const) {
  test(`all tabs are accessible (${theme})`, async ({ page }, testInfo) => {
    await page.addInitScript((t) => localStorage.setItem('ijzer.theme', t), theme)
    await onboard(page)
    for (const path of PAGES) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      expect(await scan(page), path).toEqual([])
      if (testInfo.project.name === 'iphone-390') {
        await page.screenshot({
          path: `test-results/screens/a11y-${path.replaceAll('/', '_')}-${theme}.png`,
        })
      }
    }
    // The workout screen with one exercise.
    await page.goto('/train')
    await page.getByRole('button', { name: /Vrije training/ }).click()
    await page.getByRole('button', { name: 'Oefening toevoegen' }).first().click()
    await page.getByRole('dialog').getByRole('searchbox').fill('squat')
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^Barbell Squat/ })
      .first()
      .click()
    await expect(page.getByRole('heading', { name: 'Barbell Squat' })).toBeVisible()
    expect(await scan(page), '/training').toEqual([])
    if (testInfo.project.name === 'iphone-390')
      await page.screenshot({ path: `test-results/screens/a11y-workout-${theme}.png` })
  })
}
