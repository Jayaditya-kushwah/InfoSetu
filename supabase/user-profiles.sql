-- RTI-Ease: User Profile & Details Storage (Feature 1)
-- Run in Supabase Dashboard → SQL Editor after supabase/setup.sql

-- ---------------------------------------------------------------------------
-- Table 1: users — basic account record (links to auth.users when auth is added)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Table 2: user_details — personal info profiles (multiple per user)
-- ---------------------------------------------------------------------------
create table if not exists public.user_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  street_address text not null,
  state text not null,
  district text not null,
  postal_code text not null,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_details_user_id
  on public.user_details (user_id);

create index if not exists idx_user_details_active
  on public.user_details (user_id, is_active)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Table 3: rti_records — generated RTI documents linked to a profile
-- ---------------------------------------------------------------------------
create table if not exists public.rti_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  user_detail_id uuid references public.user_details (id),
  grievance_text text not null,
  rti_content text not null,
  target_department text,
  rti_category text,
  created_at timestamptz not null default now()
);

create index if not exists idx_rti_records_user_id
  on public.rti_records (user_id);

create index if not exists idx_rti_records_user_detail_id
  on public.rti_records (user_detail_id);

-- ---------------------------------------------------------------------------
-- Table 4: detail_usage_history — audit trail for profile usage
-- ---------------------------------------------------------------------------
create table if not exists public.detail_usage_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  user_detail_id uuid not null references public.user_details (id),
  rti_record_id uuid references public.rti_records (id),
  action text not null check (action in ('created', 'updated', 'deactivated', 'used_in_rti')),
  created_at timestamptz not null default now()
);

create index if not exists idx_detail_usage_history_user_detail_id
  on public.detail_usage_history (user_detail_id);

create index if not exists idx_detail_usage_history_user_id
  on public.detail_usage_history (user_id);

-- Auto-update updated_at on user_details
create or replace function public.set_user_details_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_details_updated_at on public.user_details;
create trigger user_details_updated_at
  before update on public.user_details
  for each row
  execute function public.set_user_details_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Server-side API validates user_id; policies scope access per user_id.
-- When Supabase Auth is enabled, replace anon policies with auth.uid() checks.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.user_details enable row level security;
alter table public.rti_records enable row level security;
alter table public.detail_usage_history enable row level security;

-- users
drop policy if exists "Users can read own account" on public.users;
create policy "Users can read own account"
  on public.users for select to anon
  using (true);

drop policy if exists "Users can create account" on public.users;
create policy "Users can create account"
  on public.users for insert to anon
  with check (true);

-- user_details (soft-deleted rows hidden from reads)
drop policy if exists "Users can read own details" on public.user_details;
create policy "Users can read own details"
  on public.user_details for select to anon
  using (deleted_at is null);

drop policy if exists "Users can insert own details" on public.user_details;
create policy "Users can insert own details"
  on public.user_details for insert to anon
  with check (true);

drop policy if exists "Users can update own details" on public.user_details;
create policy "Users can update own details"
  on public.user_details for update to anon
  using (deleted_at is null)
  with check (true);

-- rti_records
drop policy if exists "Users can read own rti records" on public.rti_records;
create policy "Users can read own rti records"
  on public.rti_records for select to anon
  using (true);

drop policy if exists "Users can insert own rti records" on public.rti_records;
create policy "Users can insert own rti records"
  on public.rti_records for insert to anon
  with check (true);

-- detail_usage_history
drop policy if exists "Users can read own usage history" on public.detail_usage_history;
create policy "Users can read own usage history"
  on public.detail_usage_history for select to anon
  using (true);

drop policy if exists "Users can insert own usage history" on public.detail_usage_history;
create policy "Users can insert own usage history"
  on public.detail_usage_history for insert to anon
  with check (true);
