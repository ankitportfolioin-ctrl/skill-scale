# SkillScale

Digital-goods storefront for e-books and guides. Customers buy with Razorpay and receive
DRM-free files through expiring signed Supabase Storage URLs.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Supabase (Postgres, Auth,
Storage) · Razorpay · Resend

---

## Architecture in one pass

| Path | Responsibility |
|---|---|
| `app/api/checkout/route.ts` | Creates a Razorpay order. Prices are read from the server-side catalog — the client's submitted price is never trusted. |
| `app/api/verify-payment/route.ts` | Gives the browser an instant success/failure signal. Grants nothing; anyone can call it. |
| `app/api/webhooks/razorpay/route.ts` | **The only place an order is fulfilled.** HMAC-verified server-to-server call from Razorpay. Writes purchase entitlements, marks the order complete, emails download links. |
| `app/api/purchases/download/route.ts` | Re-signs a download URL, scoped to `user_id = auth.uid()` so a user can never fetch someone else's file. |
| `supabase/schema.sql` | Tables, Row Level Security policies, the `is_admin()` helper and the new-user trigger. Idempotent — safe to re-run. |
| `lib/supabase.ts` | Browser client (anon key, RLS-constrained). |
| `lib/supabase-server.ts` | Server client acting as the signed-in user, still RLS-constrained. |
| `lib/supabase-admin.ts` | Service-role client. Bypasses RLS. Webhook only. Never import from a client component. |

### Why there are three Supabase clients

Row Level Security is enforced through `auth.uid()`. The Razorpay webhook arrives with no
user session, so `auth.uid()` is `NULL`, `is_admin()` returns false, and the
`purchases_admin_write` policy rejects the insert. Using the anon key there produces a
silent failure mode: the payment captures, no entitlement is written, and the customer
receives nothing. That is why the webhook — and only the webhook — uses the service-role key.

---

## Local setup

**Prerequisites:** Node.js 20

```bash
npm install
cp .env.example .env.local     # then fill in every value
npm run dev                    # http://localhost:3000
```

### Database

Paste the entire contents of `supabase/schema.sql` into the Supabase SQL Editor and run it.
Then grant yourself admin (after signing in once so your `auth.users` row exists):

```sql
insert into public.admins (id, email, role, enabled)
select id, email, 'admin', true from auth.users
where lower(email) = 'your-email@example.com'
on conflict (id) do update set enabled = true;
```

The admin email list in `lib/auth-context.tsx` only controls whether the admin UI renders.
The `admins` table is what actually authorises database writes. If you add an email to one
and not the other, the panel will load and every save will fail.

### Storage

Create a private bucket named `ebooks` (the schema does this for you) and upload files at
exactly:

```
private-ebooks/{bookId}/{bookId}.zip
```

A path mismatch produces a successful payment with a broken download link.

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run lint` | `tsc --noEmit` — run before every push |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |

---

## Deploying

See `DEPLOYMENT.md` for the full sequence, including the Razorpay webhook wiring (which can
only be done after you have a live HTTPS URL) and the end-to-end verification checklist.

---

## Security notes

- The `anon` key is public by design; RLS is the actual access boundary.
- `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` must never appear in a
  `NEXT_PUBLIC_`-prefixed variable or in any `'use client'` module.
- Webhook signatures are compared with `crypto.timingSafeEqual`.
- Fulfillment is idempotent — purchase rows are keyed `${orderId}_${bookId}` and upserted,
  so Razorpay retries cannot create duplicate entitlements.
