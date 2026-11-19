# Architecture

```
 iPhone (Safari / home-screen PWA)
 ┌──────────────────────────────────────────────┐
 │ React UI (features/*)                        │
 │   │ reads/writes                             │
 │   ▼                                          │
 │ data/ repositories ──► Dexie (IndexedDB)     │  ← always written first
 │   │                      └─ outbox           │
 │   ▼ sync engine (online / focus / interval)  │
 └───┼──────────────────────────────────────────┘
     ▼ HTTPS
 Supabase: Auth · Postgres + RLS · Storage (private) · Edge Functions
                                    ├─ food-lookup  → Open Food Facts (+ product_cache)
                                    ├─ label-read   → Gemini (key in secrets)
                                    └─ ingest-steps ← iOS Shortcut (hashed token)
```

- **Layers:** `features` (screens) → `domain` (pure logic) / `data` (storage + sync) / `ui`
  (design system). Features never import each other.
- **Offline-first:** every write goes to Dexie and the outbox; the UI updates immediately. The
  cloud is the source of truth; local is cache + outbox. Conflicts: last-write-wins on
  `updated_at` per row. IDs are client-generated UUIDs so offline rows keep their identity.
- **Static hosting:** the build in `dist/` is plain files; the service worker precaches the shell
  so the app opens without network.

## Flow of one tap during a workout

1. `ActiveWorkoutPage` calls a pure operation from `src/domain/training/workoutOps.ts`
   (e.g. `completeSet`).
2. `useWorkoutState` applies it to the latest local state and queues `saveWorkout` (Dexie +
   outbox) — saves run one after another, so quick taps never build on stale data.
3. Live queries (`dexie-react-hooks`) update other screens; `useTrainingData` recomputes
   performances, which all statistics read through `performances()` (the honesty rules).

## Status

Local-first is complete; Supabase (auth, RLS, sync of the outbox) is the next step (ADR-010).
The exercise catalog is a static JSON in `public/data/` (precached), photos are cached on
first view.
