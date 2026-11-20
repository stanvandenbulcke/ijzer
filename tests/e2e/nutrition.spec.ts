import { expect, test, type Page } from '@playwright/test'

/** Food diary (SPEC §4.5): make a product once, log a portion, quick add, remove + undo. */

async function onboard(page: Page) {
  await page.goto('/welkom')
  await page.getByLabel('Naam of bijnaam').fill('Lotte')
  await page.getByLabel('Lengte').fill('168')
  await page.getByLabel('Huidig gewicht').fill('60')
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Volgende' }).click()
  await page.getByRole('button', { name: 'Klaar, naar de app' }).click()
  await expect(page).toHaveURL(/\/vandaag/)
}

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `test-results/screens/nutrition-${name}-${project}.png` })

test('log a product, quick add, remove with undo, mark the day complete', async ({
  page,
}, testInfo) => {
  const project = testInfo.project.name
  await onboard(page)
  await page
    .getByRole('navigation', { name: 'Hoofdnavigatie' })
    .getByRole('link', { name: 'Voeding' })
    .click()
  await expect(page.getByText('Ontbijt')).toBeVisible()
  await shot(page, 'empty', project)

  // Breakfast: make "Havermout" once from the label, then log 60 g.
  await page.getByRole('button', { name: 'Toevoegen aan ontbijt' }).click()
  const sheet = page.getByRole('dialog')
  await sheet.getByRole('searchbox').fill('Havermout')
  await sheet.getByRole('button', { name: 'Maak „Havermout” aan' }).click()
  await sheet.getByLabel('Energie (kcal)').fill('372')
  await sheet.getByLabel('Eiwitten (g)').fill('13,5')
  await sheet.getByLabel('Koolhydraten (g)').fill('58,7')
  await sheet.getByLabel('Vetten (g)').fill('7')
  await sheet.getByRole('button', { name: 'Opslaan en kiezen' }).click()
  await expect(sheet.getByRole('heading', { name: 'Havermout' })).toBeVisible()
  await sheet.getByRole('button', { name: '6', exact: true }).click()
  await sheet.getByRole('button', { name: '0', exact: true }).click()
  await expect(sheet.getByText('223 kcal')).toBeVisible()
  await sheet.getByRole('button', { name: 'Klaar' }).click()
  await expect(page.getByRole('button', { name: /^Havermout/ })).toContainText('223')

  // Snack: quick add for a restaurant estimate.
  await page.getByRole('button', { name: 'Toevoegen aan snacks' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Snel toevoegen' }).click()
  await page.getByRole('dialog').getByLabel('Kilocalorieën').fill('250')
  await page.getByRole('dialog').getByLabel('Eiwit (g)').fill('10')
  await page.getByRole('dialog').getByRole('button', { name: 'Toevoegen' }).click()
  await expect(page.getByText('Snel toegevoegd', { exact: true })).toBeVisible()
  await shot(page, 'diary', project)

  // Remove with undo.
  await page.getByRole('button', { name: 'Verwijder: Snel toegevoegd' }).click()
  await expect(page.getByText('Snel toegevoegd', { exact: true })).toBeHidden()
  await page.getByRole('button', { name: 'Ongedaan maken' }).click()
  await expect(page.getByText('Snel toegevoegd', { exact: true })).toBeVisible()

  // Day complete + survives a reload.
  await page.getByRole('button', { name: 'Dag volledig gelogd' }).click()
  await expect(page.getByRole('button', { name: 'Dag volledig gelogd' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.reload()
  await expect(page.getByRole('button', { name: 'Dag volledig gelogd' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByText('Gemiddeld 473 kcal op gelogde dagen')).toBeVisible()

  // Today shows what you ate.
  await page.goto('/vandaag')
  await expect(page.getByText(/473 van/)).toBeVisible()
})

test('set your own kcal and macros, and log a drink per 100 ml', async ({ page }, testInfo) => {
  await onboard(page)
  await page.goto('/voeding')

  // Own targets: kcal, protein and fat; carbs fill the rest.
  await page.getByRole('button', { name: 'Doelen aanpassen' }).click()
  const sheet = page.getByRole('dialog')
  await sheet.getByRole('button', { name: 'Zelf instellen' }).click()
  await sheet.getByLabel('Kilocalorieën').fill('2000')
  await sheet.getByLabel('Eiwit (g)').fill('150')
  await sheet.getByLabel('Vet (g)').fill('60')
  await expect(sheet.getByText(/Je macro's samen: 2\.000 kcal/)).toBeVisible()
  await page.screenshot({
    path: `test-results/screens/nutrition-goals-${testInfo.project.name}.png`,
  })
  await sheet.getByRole('button', { name: 'Doelen opslaan' }).click()
  await expect(page.getByText('/ 2.000 kcal')).toBeVisible()
  await expect(page.getByText('0 / 150 g')).toBeVisible()
  await expect(page.getByText('Je eigen doelen.', { exact: false })).toBeVisible()

  // A drink: values per 100 ml, logged in ml.
  await page.getByRole('button', { name: 'Toevoegen aan ontbijt' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Nieuw product' }).click()
  const form = page.getByRole('dialog')
  await form.getByLabel('Naam').fill('Halfvolle melk')
  await form.getByRole('button', { name: '100 ml' }).click()
  await expect(form.getByText('Voedingswaarden per 100 ml')).toBeVisible()
  await form.getByLabel('Energie (kcal)').fill('46')
  await form.getByLabel('Eiwitten (g)').fill('3,4')
  await form.getByLabel('Koolhydraten (g)').fill('4,8')
  await form.getByLabel('Vetten (g)').fill('1,5')
  await form.getByRole('button', { name: 'Opslaan en kiezen' }).click()
  await form.getByRole('button', { name: '250 ml' }).click()
  await expect(form.getByText('115 kcal')).toBeVisible()
  await form.getByRole('button', { name: 'Klaar' }).click()
  await expect(page.getByRole('button', { name: /^Halfvolle melk/ })).toContainText('250 ml')
})
