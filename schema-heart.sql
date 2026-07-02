-- ============================================================
-- Tended.Today — Heart (Qalb) module
-- Run AFTER schema.sql, in Supabase → SQL Editor → New query → Run.
-- Safe to re-run (idempotent).
-- ============================================================

create table if not exists heart_logs (
  id uuid primary key default gen_random_uuid(),
  log_date date not null default current_date,
  kind text not null                       -- mama | partner | family | self | other
    check (kind in ('mama','partner','family','self','other')),
  detail text,
  created_by text not null default 'sha',  -- 'sha' | 'hermes'
  created_at timestamptz default now()
);

alter table heart_logs enable row level security;

-- MVP permissive policy (matches schema.sql). schema-auth.sql tightens this
-- to authenticated-only once magic-link login is enabled.
drop policy if exists "anon full access" on heart_logs;
create policy "anon full access" on heart_logs for all using (true) with check (true);
