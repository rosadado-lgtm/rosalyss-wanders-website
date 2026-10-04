-- ============================================================
-- FIX: "new row violates row-level security policy for table
-- customers" error on public inquiry form submission
--
-- Run this once in your Supabase project's SQL Editor.
-- ============================================================

-- This function inserts a customer row and returns only the new
-- id. It runs as SECURITY DEFINER (elevated privilege), so it
-- does NOT require a public SELECT policy on `customers` — which
-- is important, since that table holds PII (name, email, mobile)
-- that anonymous website visitors should never be able to read.
create or replace function public.create_public_customer(
  p_full_name text,
  p_email text,
  p_mobile text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.customers (full_name, email, mobile)
  values (p_full_name, p_email, p_mobile)
  returning id into new_id;

  return new_id;
end;
$$;

-- Allow anonymous (logged-out) and authenticated website visitors
-- to call this function.
grant execute on function public.create_public_customer(text, text, text)
  to anon, authenticated;
