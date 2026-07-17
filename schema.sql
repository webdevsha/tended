-- ============================================================
-- Tended.Today — Company of One OS
-- Supabase schema · Module 1 (Money) + Module 2 (Time)
-- Run this in Supabase → SQL Editor → New query → Run
-- ============================================================

-- ---------- MODULE 1 · MONEY (Compliance Layer) ----------

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  kind text not null check (kind in ('income','expense')),
  created_at timestamptz default now()
);

insert into categories (name, kind) values
  ('Research Income (CetaLabs / Sinar)', 'income'),
  ('Education Income (Irori / Tutoring)', 'income'),
  ('Consulting / Workshops', 'income'),
  ('Other Income', 'income'),
  ('Software & Tools', 'expense'),
  ('Subscriptions', 'expense'),
  ('Professional Services', 'expense'),
  ('Zakat / Sedekah', 'expense'),
  ('Other Expense', 'expense')
on conflict (name) do nothing;

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  tx_date date not null default current_date,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'MYR',
  kind text not null check (kind in ('income','expense')),
  category text,                          -- denormalised name for simplicity
  source text,                            -- Irori | CetaLabs | Sinar | Tutoring | ...
  notes text,
  created_by text not null default 'sha', -- 'sha' | 'hermes'
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  client text not null,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'MYR',
  issue_date date default current_date,
  due_date date,
  status text not null default 'draft'
    check (status in ('draft','sent','paid','overdue','void')),
  created_by text not null default 'sha',
  created_at timestamptz default now(),
  line_items jsonb not null default '[]'::jsonb
  -- each item: {date, description, hours, rate, amount} — e.g. one row per class taught
);

-- Migration for existing projects created before line_items existed:
-- alter table invoices add column if not exists line_items jsonb not null default '[]'::jsonb;

-- ---------- MODULE 2 · TIME ----------

create table if not exists time_blocks (
  id uuid primary key default gen_random_uuid(),
  block_date date not null default current_date,
  title text not null,
  domain text not null,                   -- Irori | AIS | Family | Spiritual | Admin | Website | Other
  minutes integer not null check (minutes > 0),
  is_work boolean not null default true,  -- counts toward Pareto denominator
  source text not null default 'manual',  -- manual | gcal | hermes
  created_at timestamptz default now()
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  title text,
  content text not null,
  tags text[] default '{}',
  source text not null default 'manual',  -- manual | hermes (from Apple Notes)
  approved boolean not null default true, -- hermes drafts start false
  created_at timestamptz default now()
);

create table if not exists weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,
  content text,                           -- full reflection text (Hermes weekly reflection)
  wins text,
  stuck text,
  irori_hours numeric(5,1) default 0,
  ais_hours numeric(5,1) default 0,
  energy integer check (energy between 1 and 5),
  created_at timestamptz default now()
);

-- Migration for existing projects created before content existed:
-- alter table weekly_reviews add column if not exists content text;

create table if not exists plc_log (
  id uuid primary key default gen_random_uuid(),
  log_date date not null default current_date,
  kind text not null check (kind in ('quran','highlight','other')),
  detail text not null,
  created_at timestamptz default now()
);

-- ---------- MODULE 3 · SCORECARD (Founder Velocity, adapted) ----------
-- Count-based, not subjective-score-based — see scorecard-faculty-cxo-mapping.md.
-- RIZQ is the only metric live for now; growth_now here is a count/coverage
-- number (e.g. touchpoints, entries), never a 0-10 judgment score.

create table if not exists scorecard_scores (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  metric text not null,                   -- 'RIZQ' | 'PROFIT' | 'CASH' | ... (see mapping doc)
  growth_now numeric(10,2),
  note text,
  created_at timestamptz default now(),
  unique (week_start, metric)
);

-- ---------- SECURITY (single-user, anon key) ----------
-- MVP: RLS enabled with permissive policies for the anon role.
-- Your anon key is the password to this data — do not publish the
-- deployed page URL together with the key. Harden later with
-- Supabase Auth (email magic link) when ready.

alter table categories      enable row level security;
alter table transactions    enable row level security;
alter table invoices        enable row level security;
alter table time_blocks     enable row level security;
alter table journal_entries enable row level security;
alter table weekly_reviews  enable row level security;
alter table plc_log         enable row level security;
alter table scorecard_scores enable row level security;

do $$
declare t text;
begin
  foreach t in array array['categories','transactions','invoices','time_blocks','journal_entries','weekly_reviews','plc_log','scorecard_scores']
  loop
    execute format('drop policy if exists "anon full access" on %I', t);
    execute format('create policy "anon full access" on %I for all using (true) with check (true)', t);
  end loop;
end $$;
