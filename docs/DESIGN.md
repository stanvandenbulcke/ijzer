# Design — "Krijt & IJzer"

Industrial gym, colours of Olympic bumper plates. Source: SPEC §6. Tokens live in
`src/ui/tokens.css`; components in `src/ui/`. Everything is shown on **/design**
(`src/app/design/`). Status: waiting for Stan's approval of the style.

## Colour tokens

Plate colours are used in two ways, with separate tokens:

- **Fill** (`bg-plate-*`): identical in both themes, like the real plates.
- **Text** (`text-*-text`): tuned per theme so it passes WCAG AA on every surface.

| Utility                               | Dark                      | Light                     | Use                                            |
| ------------------------------------- | ------------------------- | ------------------------- | ---------------------------------------------- |
| `bg`                                  | #111110                   | #F4F1E8                   | page background (warm graphite / paper)        |
| `surface`, `surface-2`                | #1A1A18, #23231F          | #EBE7DB, #E0DCCF          | cards, keys, value cells                       |
| `line`                                | #2E2E29                   | #CFCABB                   | 1 px hairlines instead of shadows (decorative) |
| `line-strong`                         | #7A766A                   | #77736A                   | borders of inputs and controls (≥ 3:1)         |
| `text`, `muted`                       | #F2EFE6, #A8A496          | #151513, #5C594F          | chalk white / ink                              |
| `focus`                               | #F2C14E                   | #7A5600                   | focus ring, active tab / sub-tab bar           |
| `plate-yellow` (15 kg)                | #F2C14E                   | same                      | primary action fill, with `on-accent` text     |
| `plate-red` (25 kg)                   | #D7263D                   | same                      | PR, warnings; `on-plate` (white) text          |
| `plate-blue` (20 kg)                  | #2F6FDE                   | same                      | info, charts, rest timer                       |
| `plate-green` (10 kg)                 | #2BA84A                   | same                      | done / target zone; `on-accent` text           |
| `plate-white` (5 kg)                  | #E8E4D8                   | #FFFFFF                   | neutral highlight                              |
| `accent-text`                         | #F2C14E                   | #7A5600                   | yellow used as text                            |
| `red-text`, `blue-text`, `green-text` | #F05A6B, #6E9BF2, #3DBE5E | #B81D32, #2459B8, #18692E | plate colours as text                          |

**Volume zones** (fractional sets per muscle per week, SPEC §5.3 R1):
none = `surface-2` · low (< 6) = muted blue (#3A5FA8 dark / #A9C1EC light) · moderate (6–9) = blue · target (10–20) = green ·
high (21–25) = yellow · very high (> 25) = red.

**Muscle regions** (chips, dots): push = red · pull = blue · legs = green · core = yellow ·
neck = white. Mapping in `src/domain/muscles/taxonomy.ts`.

`npm run check:contrast` verifies every pair above in both themes (part of `npm run check`).

## Type

**Big Shoulders Display** 700/900 for headings, big numbers and button labels (uppercase,
like gym signage). **Archivo** (variable) for body text, labels and inputs. Self-hosted, numbers
always tabular. Inputs are ≥ 16 px so iOS never zooms.

## Shape and motion

Radius 6/8/10 px. No shadows. Motion 150–250 ms ease-out (`src/ui/motion.css`): sheet slides
up, toast rises, keys and buttons press in 1 px ("klik"). All off under `prefers-reduced-motion`.
Rings use square line ends: machined, not bubbly.

## Components (`src/ui/`)

| Component                    | Notes                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `Button`                     | primary / secondary / ghost / danger, md 48 px / lg 56 px. Disabled = flat surface + muted text. |
| `IconButton`                 | 44 px square; `label` required (screen readers).                                                 |
| `TextField`                  | label above, hint or error below (linked via `aria-describedby`), optional unit suffix.          |
| `Stepper`                    | −10 −1 value +1 +10; steps configurable.                                                         |
| `Chip` / `MuscleChip`        | 44 px toggle chip (`aria-pressed`); static muscle label with region bar.                         |
| `Badge`                      | PR, success, info, muted (skipped), estimate (dashed = not measured).                            |
| `SubTabs`                    | horizontal, scrollable, thick bar under the active tab.                                          |
| `ListRow`                    | hairline-separated row, optional chevron when tappable.                                          |
| `ProgressRing`               | kcal and rest timer.                                                                             |
| `NumberPad`                  | own keypad: big display, quick values, −/+ step keys, Klaar. Logic in `numberInput.ts` (tested). |
| `Sheet`                      | bottom sheet on Radix Dialog (focus trap, Escape), own styling.                                  |
| `ToastProvider` / `useToast` | one toast at a time, optional undo, 5 s.                                                         |
| `EmptyState`                 | illustration + title + text + one action.                                                        |

Icons: **Lucide** only, stroke 1.75 (2.25 for the active tab).

## Do

- Make big numbers the main character (weight, reps, kcal).
- Hairlines and spacing for structure. Tap targets ≥ 44 px, primary actions in thumb reach.
- Respect safe areas. No text selection or iOS callout on tap (`.selectable` opts back in).
- Design every empty and error state (illustration + explanation + action).
- Knurling pattern only on the landing page and the active-workout header.

## Don't

- Purple/indigo gradients, gradient text, coloured glows, glassmorphism.
- Inter, Roboto, Open Sans, Lato or the system font as brand font.
- Centred hero + pill badge + three feature cards.
- `rounded-2xl` everywhere, floating white cards with soft grey shadows.
- Emoji as icons, stock photos, mixed icon sets.
- Copying Hevy, Strong, MyFitnessPal, MacroFactor or Fitbod.
