# auth

Login, register, password reset (link, ADR-017). No magic links for login.

- **Fase:** 1
- **Belangrijkste bestanden:** `RegisterPage.tsx`, `LoginPage.tsx`, `ForgotPasswordPage.tsx`, `NewPasswordPage.tsx`, `ClaimDataPage.tsx`, `useFinishSignIn.ts`. Logica: `src/data/auth.ts`, `src/data/sync/`.
- **Afhankelijkheden:** alleen `src/domain`, `src/data`, `src/ui`, `src/i18n` — nooit een andere feature.
