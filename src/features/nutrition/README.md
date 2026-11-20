# nutrition

Tab **Voeding** (`/voeding`, `/voeding/producten`): food diary (SPEC §4.5).

- **Fase:** 5
- **Belangrijkste bestanden:** `NutritionPage.tsx` (dag-navigatie, doelen, maaltijden, dag volledig
  gelogd, weekoverzicht); submappen hieronder.
- **Logica:** `src/domain/nutrition/` (macro's, doelen met Mifflin-St Jeor en veiligheidsgrenzen,
  weekoverzicht), opslag in `src/data/nutritionRepo.ts`, doelen in `src/data/useTargets.ts`.
- **Nog niet:** barcode (Open Food Facts via edge function; wacht op Stans contactadres voor de
  User-Agent), NEVO (Stan moet het bestand downloaden), etiketfoto (Gemini-sleutel van Stan).
- **Afhankelijkheden:** alleen `src/domain`, `src/data`, `src/ui`, `src/i18n` — nooit een andere feature.
