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

Status: phase 0 — only the static shell exists. `data/` and Supabase arrive in phases 1–3; this
document grows with them.
