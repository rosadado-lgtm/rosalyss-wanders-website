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

## Still not built yet

This is the customer-facing site only. Still to build: the admin dashboard,
automated emails, and the secure quotation approval pages (see the earlier
project plan).
