# Design — "Krijt & IJzer"

Industrial gym, colours of Olympic bumper plates. Source: SPEC §6. Tokens live in
`src/ui/tokens.css`; this file explains how to use them. Status: starting point — Stan approves
the style on the `/design` page in phase 1 before anything else is built.

## Tokens

| Token (utility)        | Dark             | Light            | Use                                             |
| ---------------------- | ---------------- | ---------------- | ----------------------------------------------- |
| `bg`                   | #111110          | #F4F1E8          | page background (warm graphite / paper)         |
| `surface`, `surface-2` | #1A1A18, #23231F | #EBE7DB, #E0DCCF | cards, raised rows                              |
| `line`                 | #2E2E29          | #CFCABB          | 1 px hairlines instead of shadows               |
| `text`, `muted`        | #F2EFE6, #A8A496 | #151513, #5C594F | chalk white / ink                               |
| `plate-yellow`         | #F2C14E          | #F2C14E          | primary action **fill** (with `on-accent` text) |
| `accent-text`          | #F2C14E          | #7A5600          | accent used as **text**                         |
| `plate-red`            | #D7263D          | #B81D32          | PRs, warnings                                   |
| `plate-blue`           | #2F6FDE          | #2459B8          | info, charts                                    |
| `plate-green`          | #2BA84A          | #1C7A35          | in target zone / success                        |

Type: **Big Shoulders Display** (700/900) for headings and big numbers; **Archivo** (variable)
for UI text. Self-hosted, numbers always tabular. Radius 6/8/10 px. No shadows.

## Do

- Make big numbers the main character (weight, reps, kcal).
- Hairlines and spacing for structure. Tap targets ≥ 44 px, primary actions in thumb reach.
- Respect safe areas and `prefers-reduced-motion`. Motion 150–250 ms, ease-out.
- Design every empty and error state (illustration + explanation + action).
- Knurling pattern only on the landing page and the active-workout header.

## Don't

- Purple/indigo gradients, gradient text, coloured glows, glassmorphism.
- Inter, Roboto, Open Sans, Lato or the system font as brand font.
- Centred hero + pill badge + three feature cards.
- `rounded-2xl` everywhere, floating white cards with soft grey shadows.
- Emoji as icons, stock photos, mixed icon sets.
- Copying Hevy, Strong, MyFitnessPal, MacroFactor or Fitbod.

## To verify in phase 1

Contrast of every text/background pair (WCAG AA), muscle-group colour scheme, icon set choice.
