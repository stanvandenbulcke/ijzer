# training/together

Samen trainen (`/train/samen`): link with a one-time code, follow each other's workout live.

- `TogetherPage.tsx` (link, unlink, share toggle), `LiveCard.tsx` (a buddy's live workout),
  `BuddyStrip.tsx` (one line on the workout screen).
- Data: `src/data/live/` (buddy links via RPCs, live store); the Realtime connection is
  `src/app/LiveAgent.tsx`. Database + policies: `supabase/migrations/20261120000700_buddies.sql`,
  tests in `supabase/tests/buddies.sql`.
