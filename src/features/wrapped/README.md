# wrapped

IRON Wrapped: your month or year as a tappable story with a share image (Stan's idea #2).

- **Route:** `/wrapped/:period` with `period` = `2026-11` (month) or `2026` (year).
- **Belangrijkste bestanden:** `WrappedPage.tsx` (story frame), `slides.tsx` (one component per
  slide); numbers come from `src/domain/training/wrapped.ts`, texts from `src/i18n/nl/wrapped.ts`.
- **Delen:** `src/ui/share/shareCard.ts` draws the image; nothing is ever shared automatically.
- **Afhankelijkheden:** alleen `src/domain`, `src/data`, `src/ui`, `src/i18n` — nooit een andere feature.
