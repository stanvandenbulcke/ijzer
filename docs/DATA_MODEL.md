# Data model

Outline from SPEC §7.1. Exact columns, relations and RLS policies are written here as each
migration lands (first one: `profiles`, phase 1).

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
