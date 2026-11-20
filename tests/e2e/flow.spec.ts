import { expect, test, type Page } from '@playwright/test'

/**
 * Core flow (SPEC §8): onboarding → build a routine → log a workout with a skip → summary →
 * second workout with "last time" values, one-tap logging and a live PR.
 */

const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: `test-results/screens/flow-${name}-${project}.png` })

async function onboard(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Eerst proberen zonder account' }).click()
  await expect(page).toHaveURL(/\/welkom/)
  await page.getByLabel('Naam of bijnaam').fill('Stan')
  await page.getByLabel('Huidig gewicht').fill('78,4')
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Volgende' }).click()
  await page.getByRole('button', { name: 'Klaar, naar de app' }).click()
  await expect(page.getByRole('heading', { name: 'Hoi Stan' })).toBeVisible()
}

async function pickExercise(page: Page, query: string, name: string) {
  await page.getByRole('button', { name: 'Oefening toevoegen' }).click()
  const sheet = page.getByRole('dialog')
  await sheet.getByRole('searchbox').fill(query)
  await sheet
    .getByRole('button', { name: new RegExp(`^${name}`) })
    .first()
    .click()
  await expect(sheet).toBeHidden()
}

/** Types on our keypad and taps Klaar. After a weight the reps keypad opens by itself. */
async function keypad(page: Page, digits: string, closes = true) {
  const sheet = page.getByRole('dialog')
  for (const d of digits) await sheet.getByRole('button', { name: d, exact: true }).click()
  await sheet.getByRole('button', { name: 'Klaar' }).click()
  if (closes) await expect(sheet).toBeHidden()
}

test('onboarding, routine, workout with skip, summary, then PR on the next workout', async ({
  page,
}, testInfo) => {
  const project = testInfo.project.name
  await onboard(page)
  await shot(page, 'today-empty', project)

  // Build a routine.
  await page
    .getByRole('navigation', { name: 'Hoofdnavigatie' })
    .getByRole('link', { name: 'Train' })
    .click()
  await page.getByRole('button', { name: 'Nieuwe routine' }).first().click()
  await page.getByLabel('Naam', { exact: true }).fill('Push A')
  await pickExercise(page, 'bench', 'Barbell Bench Press - Medium Grip')
  await pickExercise(page, 'lateral raise', 'Side Lateral Raise')

  // Your own exercise, made without leaving the routine builder.
  await page.getByRole('button', { name: 'Oefening toevoegen' }).click()
  await page.getByRole('dialog').getByRole('searchbox').fill('cable y raise')
  await page.getByRole('dialog').getByRole('button', { name: 'Eigen oefening maken' }).click()
  await expect(page.getByRole('dialog').getByLabel('Naam')).toHaveValue('cable y raise')
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /^Zijkant schouder/ })
    .click()
  await page.getByRole('dialog').getByRole('button', { name: 'Oefening opslaan' }).click()
  await expect(page.getByRole('heading', { name: 'cable y raise' })).toBeVisible()
  await expect(page.getByText('Volume per spier in deze routine')).toBeVisible()
  await shot(page, 'editor', project)
  await page.getByRole('button', { name: 'Routine opslaan' }).click()
  await expect(page.getByText('Push A')).toBeVisible()
  await shot(page, 'train', project)

  // First workout: log one bench set by typing, skip the raises.
  await page.getByRole('button', { name: 'Start' }).first().click()
  await expect(page).toHaveURL(/\/training$/)
  await page.getByRole('button', { name: 'kg 1' }).first().click()
  await keypad(page, '60', false)
  await expect(page.getByRole('dialog').getByRole('status', { name: 'Reps' })).toBeVisible()
  await keypad(page, '8')
  await page.getByRole('button', { name: 'Set 1 afvinken' }).first().click()
  await expect(
    page.getByRole('button', { name: 'Set 1 niet meer afgevinkt' }).first(),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('timer')).toBeVisible()
  await shot(page, 'workout', project)

  const raises = page.locator('article', {
    has: page.getByRole('heading', { name: 'Side Lateral Raise' }),
  })
  await raises.getByRole('button', { name: 'Overslaan' }).click()
  await page.getByRole('button', { name: 'Toestel bezet' }).click()
  await expect(page.getByText('Overgeslagen · Toestel bezet')).toBeVisible()

  await page.getByRole('button', { name: 'Afronden' }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Afronden' }).click()
  await expect(page.getByRole('heading', { name: 'Goed gewerkt' })).toBeVisible()
  await expect(page.getByText('Side Lateral Raise')).toBeVisible() // listed as skipped
  await shot(page, 'summary', project)
  await page.getByRole('button', { name: 'Klaar' }).click()
  await expect(page).toHaveURL(/\/vandaag/)

  // Second workout: last time is shown, one tap logs +1 rep on the weakest set → reps PR.
  await expect(page.getByText('Vandaag getraind')).toBeVisible()
  await page.getByRole('button', { name: 'Nog een training starten' }).click()
  await expect(page.getByText('60 × 8').first()).toBeVisible()
  await expect(page.getByText(/Doel vandaag/).first()).toBeVisible()
  await page.getByRole('button', { name: 'Set 1 afvinken' }).first().click()
  await expect(page.getByRole('button', { name: 'Reps 1' }).first()).toHaveText('9')
  await expect(page.getByRole('alert')).toContainText('Nieuw record!')
  await page.waitForTimeout(1000) // let the celebration finish its animation
  await shot(page, 'pr-celebration', project)
  await page.getByRole('alert').click()
  await expect(page.getByRole('alert')).toBeHidden()
  await shot(page, 'workout-pr', project)

  // Data survives a reload mid-workout (IndexedDB, SPEC §4.4 "Robuustheid").
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Set 1 niet meer afgevinkt' }).first(),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Afronden' }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Afronden' }).click()
  await expect(page.getByRole('heading', { name: 'Goed gewerkt' })).toBeVisible()
  await page.getByRole('button', { name: 'Klaar' }).click()

  // Progress shows the history; skipped exercises never appear as performances.
  await page
    .getByRole('navigation', { name: 'Hoofdnavigatie' })
    .getByRole('link', { name: 'Progressie' })
    .click()
  await expect(page.getByText('Trainingen, laatste 12 weken')).toBeVisible()
  await page.waitForTimeout(1400) // count-up animations
  await shot(page, 'progress', project)
  await page.getByText('Hoe hard je elke spier raakte').evaluate((el) => el.scrollIntoView())
  await page.waitForTimeout(600)
  await shot(page, 'progress-map', project)
  await page.getByRole('tab', { name: 'Oefeningen' }).click()
  await expect(page).toHaveURL(/\/progressie\/oefeningen/)
  const benchRow = page.getByRole('button', { name: /^Barbell Bench Press.*sessies/ })
  await expect(benchRow).toBeVisible()
  await expect(page.getByRole('button', { name: /Side Lateral Raise/ })).toHaveCount(0)
  await benchRow.click()
  await expect(page.getByText('Rep-records')).toBeVisible()
  await shot(page, 'exercise-progress', project)

  // Muscle levels from what was logged (skipped exercises give nothing).
  await page.goto('/progressie/spiergroepen')
  await expect(page.getByText('Spierlevels')).toBeVisible()
  await page.waitForTimeout(600)
  await shot(page, 'levels', project)
  await page.getByRole('button', { name: 'Hoe werkt dit?' }).click()
  await expect(page.getByRole('dialog')).toContainText('halterschijven')
  await page.keyboard.press('Escape')

  // IRON Wrapped for this month, as a story.
  await page.goto('/progressie/overzicht')
  await page
    .getByRole('button', { name: /in IRON/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/wrapped\//)
  await page.getByRole('button', { name: 'Volgende' }).click()
  await expect(page.getByText('trainingen', { exact: true })).toBeVisible()
  await page.waitForTimeout(1200)
  await shot(page, 'wrapped', project)

  // The morning check-in on Today.
  await page.goto('/vandaag')
  await page.getByRole('button', { name: 'Energie: 4 van 5' }).click()
  await page.getByRole('button', { name: 'Slaap vannacht: 3 van 5' }).click()
  await expect(page.getByText('Bewaard. Je kan het vandaag nog aanpassen.')).toBeVisible()
  await shot(page, 'today-after', project)
})

test('library search with abbreviations and exercise detail', async ({ page }, testInfo) => {
  await onboard(page)
  await page.goto('/train/oefeningen')
  await page.getByRole('searchbox').fill('rdl')
  await page
    .getByRole('button', { name: /^Romanian Deadlift/ })
    .first()
    .click()
  await expect(page.getByRole('heading', { name: 'Romanian Deadlift' })).toBeVisible()
  await expect(page.getByText('Lange spierlengte').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Bekijk uitleg op YouTube' })).toHaveAttribute(
    'href',
    /youtube\.com\/results/,
  )
  await page.screenshot({
    path: `test-results/screens/flow-exercise-${testInfo.project.name}.png`,
    fullPage: true,
  })
})

test('ticking an empty set asks for the values and then ticks it; finish names what is open', async ({
  page,
}) => {
  await onboard(page)
  await page.goto('/train')
  await page.getByRole('button', { name: /Vrije training/ }).click()
  await pickExercise(page, 'billen', 'Barbell Hip Thrust')
  await pickExercise(page, 'bulgaarse', 'Split Squat with Dumbbells')

  // ✓ on an empty set: keypad for kg, then reps, and "Klaar" ticks the set.
  await page.getByRole('button', { name: 'Set 1 afvinken' }).first().click()
  await keypad(page, '40', false)
  await keypad(page, '8')
  await expect(
    page.getByRole('button', { name: 'Set 1 niet meer afgevinkt' }).first(),
  ).toHaveAttribute('aria-pressed', 'true')

  // Typed in but not ticked: the finish sheet offers to tick it and names the open exercise.
  await page.getByRole('button', { name: 'kg 2' }).first().click()
  await keypad(page, '40', false)
  await keypad(page, '9')
  await page.getByRole('button', { name: 'Afronden' }).first().click()
  const sheet = page.getByRole('dialog')
  await expect(sheet.getByText('1 set is ingevuld maar niet afgevinkt')).toBeVisible()
  await expect(sheet.getByText('Split Squat with Dumbbells')).toBeVisible()
  await sheet.getByRole('button', { name: 'Alles afvinken' }).click()
  await expect(sheet.getByText('ingevuld maar niet afgevinkt')).toBeHidden()
  await sheet.getByRole('button', { name: 'Afronden' }).click()
  await expect(page.getByRole('heading', { name: 'Goed gewerkt' })).toBeVisible()

  // Today now says you trained, instead of offering the same workout again.
  await page.getByRole('button', { name: 'Klaar' }).click()
  await expect(page.getByText('Vandaag getraind')).toBeVisible()
})
