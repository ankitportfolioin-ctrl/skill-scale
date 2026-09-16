# Changes applied to this repository

Everything below is already in the folder. This file is the record of what changed, why,
and what is still yours to do.

---

## Critical — fulfillment was broken

### 1. Razorpay webhook now uses a service-role Supabase client
`app/api/webhooks/razorpay/route.ts`, new `lib/supabase-admin.ts`

The webhook built its Supabase client with the **anon key**. It runs server-to-server with
no user session, so `auth.uid()` is `NULL` and `public.is_admin()` returns false. Against
your own RLS policies:

- `purchases_admin_write` → the `purchases.upsert` was rejected
- `orders_admin_update` → the status update affected 0 rows
- `ebooks_owner_read` → `createSignedUrl` on the private bucket was denied

Net effect: Razorpay captures the payment, no entitlement is written, no email is sent, the
order sits at `Processing` forever. The customer pays and receives nothing.

Fixed by adding `lib/supabase-admin.ts`, a service-role client that bypasses RLS, used by
the webhook and nowhere else. It carries `import 'server-only'`, so importing it from a
client component becomes a build error rather than a runtime key leak.

The route was also rewritten from its single-line minified form into readable, commented
code, with these behavioural improvements:

- Signature comparison now uses `crypto.timingSafeEqual` instead of `!==`
- Malformed JSON returns 400 instead of throwing
- Unhandled event types return 200 so Razorpay stops retrying them
- A missing `notes.userId` returns 200 (retrying cannot fix missing data) and logs loudly
- A storage-signing failure no longer aborts the whole order — the entitlement is still
  recorded so the customer can re-request the link from their account page
- A failed delivery email no longer rolls back fulfillment or triggers a retry
- Book titles are HTML-escaped before going into the email body
- Fulfillment is documented and confirmed idempotent (`${orderId}_${bookId}` upsert)

### 2. `SUPABASE_SERVICE_ROLE_KEY` added to `.env.example`
It was required by the code path above but documented nowhere. **You must set this** in
your host's environment variables or the webhook will now throw a clear startup error
naming the variable.

---

## High — silent failure modes

### 3. Razorpay keys fail fast
`lib/razorpay.ts`

Was falling back to `'rzp_test_placeholder'` / `'placeholder_secret'`, turning a missing
config into an opaque Razorpay auth error at checkout. Now throws an error naming the exact
variables. Still lazily evaluated, so `next build` does not require the keys to be present.

### 4. Missing Supabase env vars now warn
`lib/supabase.ts`

The hardcoded `SUPABASE_DEFAULT_URL` / `SUPABASE_DEFAULT_ANON_KEY` fallbacks are kept (the
anon key is public by design, so this is not a leak) but they now log a warning. Previously
a missing env var in production would silently point your live store at the development
Supabase project.

---

## Repository hygiene

### 5. Folder structure flattened
The archive had a stale Google AI Studio Vite scaffold wrapping the real app, containing
**older duplicate copies** of `app/`, `lib/`, `supabase/` and `public/` — including a
different `lib/auth-context.tsx`. That outer layer is gone. `project-nexa/` is now the
repository root, and `.git` (with your `skill-scale` remote and branch `main`) came with it.

### 6. Duplicate lockfile removed
`bun.lock` and `package-lock.json` were both tracked, so hosts picked one unpredictably.
Kept `package-lock.json`; removed `bun.lock` from disk and from the git index.
**If you actually use bun**, reverse this: `rm package-lock.json && bun install`.

### 7. `.gitignore` extended
Now covers `tsconfig.tsbuildinfo`, `next-env.d.ts`, `.next/`, `out/`, `dist/`, `.env`,
`.env.production`, editor folders and logs. `tsconfig.tsbuildinfo` was removed from the
index.

### 8. Dead config removed
`next.config.mjs` no longer lists the Google Cloud Run sandbox domains in
`allowedDevOrigins`. `output: 'standalone'` was kept.

### 9. `GEMINI_API_KEY` dropped
Not referenced anywhere in the application.

---

## Documentation

### 10. `README.md` rewritten
Was the Google AI Studio boilerplate with a Gemini banner. Now documents the actual
architecture, the three Supabase clients and why they exist, local setup, the storage path
convention, and the admin-seeding requirement.

### 11. `security_spec.md` rewritten
Described Firestore rules and `/users/{userId}` paths for a Firebase stack that no longer
exists. Now documents the Supabase RLS trust model, per-table invariants, payment integrity,
a 12-row attack/expected-outcome table, secret handling, and known gaps.

### 12. `DEPLOYMENT.md` added
Full step-by-step deploy runbook. Phases 0 and 1 are marked as already applied.

### 13. `supabase/seed-admin.sql` added
The SQL to grant yourself admin. Replace the placeholder email before running.

---

## Not changed, deliberately

- **The admin email allowlist** in `lib/auth-context.tsx` (`portfolio.ankit.in@gmail.com`
  and two others). It only gates whether the admin UI renders; the `admins` table is what
  authorises writes. Left alone because changing your admin identity mid-migration is your
  call, not mine. Just keep the two in sync.
- **`supabase/schema.sql`.** The RLS policies are well-constructed. No changes needed.
- **`app/api/checkout/route.ts`** and **`app/api/purchases/download/route.ts`.** Both were
  already correct — server-side pricing, and ownership-filtered download lookups.

---

## What you must do

1. **Run `npm install` then `npm run lint` and `npm run build` locally.** I could not run
   them here — the build environment has no network access, so dependencies could not be
   installed. The changed files are structurally sound but have not been compiled against
   your actual dependency tree. Do this before you push.
2. **Set `SUPABASE_SERVICE_ROLE_KEY`** in `.env.local` and in your host. The webhook now
   throws without it.
3. **Run `supabase/seed-admin.sql`** with your email substituted in.
4. **Follow `DEPLOYMENT.md` from Phase 2.**
5. **Commit with real messages.** Your history is `lauda`, `gendu`, `gendu0000`. When a
   payment bug appears in three months, that history is the only tool you have.
