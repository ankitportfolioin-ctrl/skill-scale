# SkillScale — Git Push & Deploy Runbook

**Repo:** `https://github.com/ankitportfolioin-ctrl/skill-scale.git` (branch `main`)
**App root:** `project-nexa/` — *not* the outer folder
**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase (Postgres + Auth + Storage) · Razorpay · Resend

---

> **Status:** Phases 0 and 1 are ALREADY APPLIED in this repository. They are documented
> below so you know what changed and why. Start executing from **Phase 2**.

---

## PHASE 0 — The blocker (already fixed)

Left here as the record of what was wrong. Payments would have succeeded while customers
received nothing.

`app/api/webhooks/razorpay/route.ts` builds its Supabase client with the **anon key**:

```ts
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY
const db = () => createClient(url, key, {...})
```

Your `supabase/schema.sql` has RLS enabled with:

```sql
create policy purchases_admin_write on public.purchases
  for all using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_update on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
```

The webhook runs server-to-server with no user session, so `auth.uid()` is `NULL` and
`is_admin()` returns `false`. Every fulfillment write is rejected:

| Operation | Result |
|---|---|
| `purchases.upsert(...)` | RLS violation → throws |
| `orders.update({status:'Completed'})` | silently affects 0 rows |
| `storage.from('ebooks').createSignedUrl(...)` | denied (private bucket) |

### Fix

Add a service-role client used **only** inside the webhook:

```ts
// lib/supabase-admin.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  throw new Error('FATAL: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
}

// Bypasses RLS. Never import this into a client component.
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
```

Then in the webhook, replace `const db = () => createClient(url, key, ...)` and every
`const client = db()` with `supabaseAdmin`.

**Rules:** the variable name must **not** start with `NEXT_PUBLIC_` (that would ship it to the
browser), and `lib/supabase-admin.ts` must never be imported by a `'use client'` file.

### Also fix in Phase 0

1. **`lib/razorpay.ts`** falls back to `'rzp_test_placeholder'` / `'placeholder_secret'`.
   In production this produces confusing auth errors instead of a clear failure. Throw instead:
   ```ts
   const key_id = process.env.RAZORPAY_KEY_ID
   const key_secret = process.env.RAZORPAY_KEY_SECRET
   if (!key_id || !key_secret) throw new Error('FATAL: Razorpay keys not configured.')
   ```

2. **`.env.example`** is missing `SUPABASE_SERVICE_ROLE_KEY`. Add it with a comment so the next
   person doesn't repeat this.

3. **Seed the `admins` table.** `lib/auth-context.tsx` gates the admin *UI* on a hardcoded email
   list, but the *database* gates writes on `is_admin()`. If your account isn't in `admins` or
   `profiles.role='admin'`, the admin panel will render and every save will fail. Run in the
   Supabase SQL Editor after you've signed in once:
   ```sql
   insert into public.admins (id, email, role, enabled)
   select id, email, 'admin', true from auth.users
   where lower(email) = 'portfolio.ankit.in@gmail.com'
   on conflict (id) do update set enabled = true;
   ```

---

## PHASE 1 — Clean the repo

### 1.1 Work in the right folder

The zip has two layers. The outer folder is a leftover Google AI Studio Vite scaffold with an
empty `dependencies: {}` — it cannot build and is not your app. It contains **stale duplicate
copies** of `app/`, `lib/`, `supabase/`, and `public/` that are older than the real ones.

```bash
cd project-nexa
git remote -v      # should show ankitportfolioin-ctrl/skill-scale.git
git status
```

If the remote is missing, you're in the wrong directory.

> **Recurring pitfall:** you've hit this before — editing a downloaded export folder that has no
> `.git`, then wondering why deploys don't pick up changes. Always confirm `git remote -v` first.

### 1.2 Delete the outer scaffold

Once you've confirmed `project-nexa/` builds, delete the outer `app/`, `lib/`, `public/`,
`supabase/`, `vite.config.ts`, `tsconfig.json`, `package.json`, `.env.local`, and `README.md`.
Keeping two copies of `lib/auth-context.tsx` that differ is how you ship a fix to the wrong file.

### 1.3 Pick one lockfile

Both `bun.lock` and `package-lock.json` are tracked. Vercel and Railway will pick one
unpredictably, so builds stop being reproducible.

```bash
# if you use npm
git rm --cached bun.lock && rm bun.lock

# OR if you use bun
git rm --cached package-lock.json && rm package-lock.json
```

### 1.4 Extend `.gitignore`

```gitignore
# build artifacts
tsconfig.tsbuildinfo
.next/
out/
next-env.d.ts

# env
.env
.env*.local
```

Then drop anything already tracked that shouldn't be:

```bash
git rm --cached tsconfig.tsbuildinfo
```

### 1.5 Verify no secrets are staged

```bash
git status --short
git diff --cached | grep -iE "sk_live|rzp_live|_secret|SERVICE_ROLE|BEGIN PRIVATE KEY"
```

Expect **no output** from the grep. If anything appears, unstage it before committing — scrubbing
a secret from git history afterwards is far more work than catching it here.

---

## PHASE 2 — Build locally before pushing

Never push a build you haven't run. Railway/Vercel build failures cost 3–5 minutes per attempt.

```bash
npm install          # or: bun install
npm run lint         # tsc --noEmit
npm run build        # next build
```

Fix every error here. The Firebase→Supabase migration deleted `lib/firebase.ts`,
`lib/firebase-admin.ts`, and `lib/auth-errors.ts` — if anything still imports them, `tsc` will
tell you now instead of the deploy log telling you later.

Then smoke-test with a real `.env.local`:

```bash
npm run dev
```

Check: homepage renders → sign-in works → admin panel loads → a product saves without an RLS error.

---

## PHASE 3 — Commit and push

Your three existing commits are `lauda`, `gendu`, `gendu0000`. Nobody can tell what changed. If
you ever need to bisect a regression or hand this repo to a collaborator, this history is useless.
Start writing real messages now.

Stage in logical chunks rather than one giant `git add .`:

```bash
# 1. remove the dead Firebase layer
git add -u lib/firebase.ts lib/firebase-admin.ts lib/auth-errors.ts \
  firebase.json .firebaserc firestore.rules storage.rules \
  firebase-applet-config.json firebase-blueprint.json
git commit -m "chore: remove Firebase auth layer ahead of Supabase migration"

# 2. add the Supabase layer
git add lib/supabase.ts lib/supabase-server.ts lib/supabase-admin.ts lib/supabase/ supabase/
git commit -m "feat: add Supabase client, server helpers and RLS schema"

# 3. the webhook fix from Phase 0
git add app/api/webhooks/razorpay/route.ts lib/razorpay.ts .env.example
git commit -m "fix: use service-role client in Razorpay webhook so fulfillment passes RLS"

# 4. everything else
git add -A
git commit -m "refactor: migrate auth, admin and product services to Supabase"
```

Push:

```bash
git push origin main
```

If it's rejected as non-fast-forward, someone (or another machine) pushed first:

```bash
git pull --rebase origin main
# resolve conflicts, then:
git push origin main
```

---

## PHASE 4 — Provision Supabase

1. **supabase.com** → your project → **SQL Editor** → paste all of `supabase/schema.sql` → Run.
   It's idempotent (`create table if not exists`, drops old policies first), so re-running is safe.
2. **Storage** → confirm the `ebooks` bucket exists and is **not public**.
3. Upload your files to match the path the webhook expects exactly:
   `private-ebooks/{bookId}/{bookId}.zip`
   A mismatch here produces a successful payment and a broken download link.
4. **Settings → API** → copy three values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ← **secret, server-only**
5. **Authentication → URL Configuration** → set Site URL and Redirect URLs to your production
   domain, or email confirmation and password-reset links will point at `localhost`.

---

## PHASE 5 — Deploy on Vercel

Vercel is the right target here: it's built by the Next.js team, handles App Router, Server
Actions and route handlers with no configuration, and gives you a stable HTTPS URL for the
Razorpay webhook. Railway also works (`output: 'standalone'` is already set in
`next.config.mjs`), but you'd be configuring a Dockerfile and port binding by hand for no gain.

### 5.1 Import

1. **vercel.com** → **Add New → Project** → **Import Git Repository**
2. Authorize GitHub, select `ankitportfolioin-ctrl/skill-scale`
3. **Root Directory:** if you deleted the outer scaffold in 1.2, leave as `./`. If you kept it,
   click **Edit** and set it to `project-nexa`. Getting this wrong is the single most common
   cause of "no Next.js version detected".
4. Framework Preset: **Next.js** (auto-detected). Leave build/output commands empty.

### 5.2 Environment variables

**Settings → Environment Variables.** Add each to Production, Preview, and Development:

| Variable | Value | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Yes (fine) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes (fine) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key | **No — server only** |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | No |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | No |
| `RAZORPAY_WEBHOOK_SECRET` | *(fill in Phase 6)* | No |
| `RESEND_API_KEY` | Resend API key | No |
| `EMAIL_FROM` | e.g. `orders@yourdomain.com` | No |

Start with Razorpay **test-mode** keys (`rzp_test_...`). Switch to live only after Phase 7 passes.

### 5.3 Deploy

Click **Deploy**. Watch the build log. On success you get `https://skill-scale-xxxx.vercel.app`.

Every future `git push origin main` now redeploys automatically. Pushes to other branches get
preview URLs.

---

## PHASE 6 — Wire the Razorpay webhook

This can only happen **after** you have a live URL.

1. **Razorpay Dashboard → Settings → Webhooks → Add New Webhook**
2. **Webhook URL:** `https://<your-domain>/api/webhooks/razorpay`
3. **Secret:** generate a strong random string, e.g.
   ```bash
   openssl rand -hex 32
   ```
   Paste it into Razorpay **and** into Vercel as `RAZORPAY_WEBHOOK_SECRET`. They must match byte
   for byte — your handler HMACs the raw body against it and rejects on mismatch.
4. **Active Events:** tick `payment.captured` (that's the only event the handler processes).
5. Save, then **redeploy on Vercel** so the new env var is picked up. Vercel does not apply env
   changes to an already-built deployment.

---

## PHASE 7 — End-to-end verification

Run this in test mode before touching live keys. Each step must pass before the next.

1. **Sign up** with a fresh email → confirm a row appears in `public.profiles`
   (the `on_auth_user_created` trigger should handle it).
2. **Add to cart → Checkout** → confirm a row in `public.orders` with `status = 'Processing'`.
3. **Pay** with a Razorpay test card → you should land on `/checkout/success`.
4. **Razorpay Dashboard → Webhooks → your endpoint → Recent Deliveries** → confirm `200`.
   A `400` means the secret doesn't match. A `500` means fulfillment threw — check Vercel logs.
5. **Supabase** → confirm a row in `public.purchases` and the order flipped to `'Completed'`.
   *If purchases is still empty, Phase 0 wasn't applied.*
6. **Check the inbox** for the Resend delivery email with working download links.
7. **Click a download link** → file downloads.
8. **Negative test:** sign in as a second, different user and call the download endpoint with the
   first user's `purchaseId`. Expect `404 Purchase not found` — that proves the
   `.eq('user_id', user.id)` ownership filter is holding.

Only after all eight pass: swap `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` to live keys, create a
**separate live-mode webhook** in Razorpay with its own secret, update
`RAZORPAY_WEBHOOK_SECRET`, and redeploy.

---

## PHASE 8 — Custom domain

1. **Vercel → Settings → Domains → Add** → enter your domain
2. At your registrar, add the DNS records Vercel shows (usually `A → 76.76.21.21` for apex and
   `CNAME → cname.vercel-dns.com` for `www`)
3. Wait for propagation; HTTPS is issued automatically
4. **Go back and update:**
   - Supabase → Authentication → URL Configuration → Site URL + Redirect URLs
   - Razorpay → webhook URL → your custom domain

---

## Cleanup backlog (non-blocking)

| Item | Why |
|---|---|
| `README.md` still says "Run and deploy your AI Studio app" with a Gemini banner | Misleading to anyone who opens the repo |
| `security_spec.md` describes Firestore rules and `/users/{userId}` paths | Stale — the app is on Supabase RLS now; rewrite or delete |
| `GEMINI_API_KEY` in `.env.example` | No longer referenced anywhere in `project-nexa` |
| Hardcoded `SUPABASE_DEFAULT_URL` / `SUPABASE_DEFAULT_ANON_KEY` in `lib/supabase.ts` | The anon key is public by design so this isn't a leak, but the fallback means a missing env var silently points production at that project instead of failing loudly |
| `allowedDevOrigins` in `next.config.mjs` lists Cloud Run URLs | Dead config from the AI Studio sandbox |
| Admin email allowlist in `lib/auth-context.tsx` | Fine as UI gating, but it can drift from the `admins` table. Treat the table as the source of truth |
