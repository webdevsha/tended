-- ============================================================
-- Tended.Today — Auth hardening (magic-link)
-- Run this ONLY after you have enabled Supabase Auth and can log in
-- with a magic link. It replaces the permissive "anon full access"
-- policies with authenticated-only policies, so publishing the site URL
-- (with its public anon key) no longer exposes your data — a visitor
-- must be logged in.
--
-- Order of operations:
--   1. Deploy the site, confirm magic-link login works for your email.
--   2. In Supabase → Authentication → Providers → Email: keep "Confirm email"
--      on. In Authentication → Sign-ups, DISABLE new sign-ups so only your
--      pre-invited email can log in (Authentication → Users → invite yourself).
--   3. Run this file.
--
-- Safe to re-run (idempotent). To roll back to the open MVP, re-run schema.sql.
-- ============================================================

do $$
declare t text;
begin
  foreach t in array array[
    'categories','transactions','invoices','time_blocks',
    'journal_entries','weekly_reviews','plc_log','heart_logs'
  ]
  loop
    -- drop the permissive MVP policy
    execute format('drop policy if exists "anon full access" on %I', t);
    -- authenticated users get full access; anon (logged-out) get nothing
    execute format('drop policy if exists "authenticated full access" on %I', t);
    execute format(
      'create policy "authenticated full access" on %I for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;
