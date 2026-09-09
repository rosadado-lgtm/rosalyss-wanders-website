# Rosalyss Wanders Travel and Tours Services — Website

A Vite + React + Tailwind site wired live to Supabase (project `rdxziaotuzsvibbwlmnw`).

## What's connected

- Inquiry form → writes to `customers` + `inquiries` tables
- Referral links (`?ref=CODE`) → auto-captured, resolved via `lookup_referral_code`
- Travel Partner registration → calls `register_partner`
- Partner dashboard lookup → calls `get_partner_dashboard`

Supabase URL and the public **publishable** key are read from environment variables
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), with the current project's values as
a fallback in the code. These are safe to expose in client-side code — they're the
public anon key, not a secret. Row Level Security in Supabase controls what can
actually be read or written with them.

## Deploy to Vercel

### Option A — GitHub (recommended, gives automatic redeploys)

1. Push this folder to a new GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import that repository.
3. Vercel auto-detects Vite — leave the default build settings:
   - Build command: `vite build`
   - Output directory: `dist`
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://rdxziaotuzsvibbwlmnw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_JA9Ncqvhx0omEOlORGyTXw_m7KlAzbJ`
5. Click **Deploy**. You'll get a live `*.vercel.app` URL in about a minute.

### Option B — Vercel CLI (no GitHub needed)

```bash
npm i -g vercel
cd rosalyss-wanders-site
vercel
```

Follow the prompts (link or create a project), then set the same two environment
variables when asked, or afterward with:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Then deploy to production:

```bash
vercel --prod
```

## Connect your domain

Once the project is live on Vercel:

1. Open the project in the Vercel dashboard → **Settings → Domains**.
2. Add your domain (e.g. `rosalysswanders.com` or `www.rosalysswanders.com`).
3. Vercel will show you either:
   - an **A record** to point your domain's root to, or
   - a **CNAME record** (usually `cname.vercel-dns.com`) for a subdomain like `www`.
4. Add that record at your domain registrar (wherever you bought the domain — GoDaddy,
   Namecheap, Google Domains, etc.).
5. Propagation usually takes a few minutes up to a few hours. Vercel issues an SSL
   certificate automatically once it verifies the record.

If you bought the domain through a Philippine registrar and aren't sure where to add
DNS records, look for "DNS Management" or "Nameservers" in that registrar's dashboard —
send a screenshot if you want help finding the right screen.

## Local development

```bash
npm install
npm run dev
```

## Admin Dashboard

Visit `/admin` on the deployed site (e.g. `https://rosalysswanders.com/admin`) to sign in.

- **Sign-in account:** `rosadado@rosalysswanders.com` (the Supabase Auth account already on
  the project) has been granted admin access. Use whatever password is set for that account
  in Supabase Auth. To add another admin later, create the user in Supabase Auth, then run in
  the SQL Editor:
  `insert into public.admin_users (user_id) values ('<their auth user id>');`
- **Referral Partners tab:** deactivate a partner (suspends their referral code — reversible)
  or permanently remove them (deletes their record and payout/agreement history — not
  reversible). Use **Record Booking** on an active partner to log a confirmed sale against
  their code — commission is calculated automatically (₱500 flat for 1 pax, ₱750/pax for 2–4,
  ₱1000/pax for 5+) and immediately reflected in their public partner-dashboard lookup on the
  main site.
- **Destination Funnels tab:** for each destination, copy a generic link, a Facebook-tagged
  link, or an Instagram-tagged link. Each link opens the site with that destination
  pre-selected in the inquiry form. Visits and resulting inquiries are tracked per destination
  and per platform right on that tab.

## Bugs fixed while wiring this up

Two pre-existing issues were found and fixed so the funnel tracking and partner tools would
actually work:

- The public inquiry form was posting fields (`customer_id`, `airport_origin`, `adults`, ...)
  that don't exist on the live `inquiries` table, and anonymous visitors didn't have permission
  to insert into it at all — so **no inquiry submitted through the site was actually being
  saved**. It now goes through a new `create_public_inquiry` database function that matches
  the real schema.
- `lookup_referral_code` checked for `status = 'active'`, but a partner's status is only ever
  `'approved'` or `'suspended'` — so referral codes never resolved. Fixed to check `'approved'`.
- The partner-earnings functions (`get_partner_dashboard`, `record_booking`, the commission
  trigger) referenced `bookings` columns (`referrer_id`, `pax`, `product`, `commission`) that
  didn't exist on the live table, so every partner's earnings showed ₱0 and logging a booking
  would have errored outright. Added the missing columns, reattached the commission-calculation
  trigger, and fixed a second `'fully_paid'` vs `'paid'` status mismatch in the earnings query.
- `record_booking` had `EXECUTE` granted to `anon`, meaning anyone could call it without
  logging in and fabricate bookings. It's now restricted to authenticated admins only.

## Still not built yet

This is the customer-facing site only. Still to build: the admin dashboard,
automated emails, and the secure quotation approval pages (see the earlier
project plan).
