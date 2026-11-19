import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('/design style page', () => {
  test('renders every section in both themes without accessibility violations', async ({
    page,
  }, testInfo) => {
    await page.goto('/design')
    await expect(page.getByRole('heading', { level: 1, name: 'Ontwerp' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(8)

    for (const theme of ['Donker', 'Licht'] as const) {
      await page.getByRole('button', { name: theme }).click()
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([])
      await page.screenshot({
        path: `test-results/screens/design-${testInfo.project.name}-${theme === 'Donker' ? 'dark' : 'light'}.png`,
        fullPage: true,
      })
    }
  })

  test('keypad edits a weight and the sheet opens and closes', async ({ page }, testInfo) => {
    await page.goto('/design')
    const display = page.locator('output[aria-label="Gewicht"]').first()
    await expect(display).toHaveText(/82,5/)

    // First digit replaces the value, then comma + decimal, then a +2,5 step.
    await page.getByRole('button', { name: '9', exact: true }).first().click()
    await page.getByRole('button', { name: '0', exact: true }).first().click()
    await expect(display).toHaveText(/^90/)
    await page.getByRole('button', { name: 'Plus 2,5' }).first().click()
    await expect(display).toHaveText(/92,5/)
    await page.getByRole('button', { name: 'Wis laatste cijfer' }).first().click()
    await expect(display).toHaveText(/^–/)

    await page.getByRole('button', { name: 'Open als paneel' }).click()
    const sheet = page.getByRole('dialog', { name: 'Set 2 · gewicht' })
    await expect(sheet).toBeVisible()
    await sheet.getByRole('button', { name: /Vorige keer/ }).click()
    await expect(sheet.locator('output')).toHaveText(/82,5/)
    await page.screenshot({
      path: `test-results/screens/design-sheet-${testInfo.project.name}.png`,
    })
    await sheet.getByRole('button', { name: 'Klaar' }).click()
    await expect(sheet).toBeHidden()
  })

  test('a set is checked with one tap and the toast offers undo', async ({ page }) => {
    await page.goto('/design')
    const check = page.getByRole('button', { name: 'Set 2 afvinken' })
    await check.click()
    await expect(page.getByRole('button', { name: 'Set 2 afgevinkt' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await page.getByRole('button', { name: 'Toon melding' }).click()
    await expect(page.getByRole('status', { name: 'Meldingen' })).toContainText(
      'Banaan verwijderd uit Lunch',
    )
    await page.getByRole('button', { name: 'Ongedaan maken' }).click()
    await expect(page.getByRole('status', { name: 'Meldingen' })).toContainText('Teruggezet')
  })
})
