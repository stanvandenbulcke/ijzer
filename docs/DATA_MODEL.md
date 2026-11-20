# Data model

**As built (2026-11-20).** Every synced table is a document table: `id`, `user_id`, `data jsonb`,
`created_at`, `updated_at`, `deleted_at`, `server_updated_at` (server clock, pull cursor), RLS
forced with "own rows" policies, trigger `ijzer_touch` (newest edit wins), 256 KB row limit.

| Local (Dexie)     | Postgres           | What                                    |
| ----------------- | ------------------ | --------------------------------------- |
| `profile` (`me`)  | `profiles`         | profile + settings (row id = user id)   |
| `customExercises` | `custom_exercises` | own exercises                           |
| `routines`        | `routines`         | routines with nested exercises and sets |
| `workouts`        | `workouts`         | workouts with nested exercises and sets |
| `bodyWeights`     | `body_weights`     | one weigh-in per day                    |
| `checkIns`        | `check_ins`        | energy + sleep, one per day             |
| `foods`           | `foods`            | own products (per 100 g/ml)             |
| `foodLogs`        | `food_logs`        | logged items with per-100 g snapshot    |
| `nutritionDays`   | `nutrition_days`   | "dag volledig gelogd"                   |
| `photos`          | —                  | progress photos, LOCAL ONLY (ADR-024)   |
| `outbox`, `meta`  | —                  | sync queue, owner + cursors             |

Migrations: `supabase/migrations/`; RLS tests: `supabase/tests/rls.sql`. The outline below is
the original target from SPEC §7.1.

**Every table:** `id uuid` (client-generated), `created_at`, `updated_at`, `deleted_at`
(soft delete for sync), `user_id` where applicable. **RLS on every table.**

| Area             | Tables                                                                                      | Access                                                   |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Profile          | `profiles`                                                                                  | owner only                                               |
| Taxonomy         | `muscles`                                                                                   | read for signed-in users                                 |
| Exercises        | `exercises`, `exercise_muscles`                                                             | global rows read-only; own rows owner only               |
| Routines         | `routines`, `routine_exercises`, `routine_sets`                                             | owner only                                               |
| Workouts         | `workouts`, `workout_exercises`, `workout_sets`                                             | owner only                                               |
| Records          | `personal_records` (derived)                                                                | owner only                                               |
| Nutrition        | `foods`, `food_logs`, `meals`, `meal_items`, `day_status`, `supplements`, `supplement_logs` | owner only                                               |
| Shared food data | `product_cache`, `generic_foods`                                                            | read for signed-in users; writes only via edge functions |
| Body             | `body_weights`, `body_measurements`, `progress_photos`                                      | owner only (photos in private bucket)                    |
| Steps            | `daily_steps`, `step_tokens` (hash only)                                                    | owner only                                               |
| Buddies          | `buddy_links`, `shared_routines`                                                            | both parties, limited by sharing settings                |
| Limits           | `label_scan_usage`                                                                          | owner read; writes via edge function                     |
