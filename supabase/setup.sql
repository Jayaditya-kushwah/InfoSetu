-- RTI-Ease Supabase setup
-- Run this in Supabase Dashboard → SQL Editor → New query → Run

create table if not exists public.rti_applications (
  id uuid primary key default gen_random_uuid(),
  user_input text not null,
  generated_draft text not null,
  target_department text not null,
  created_at timestamptz not null default now()
);

alter table public.rti_applications enable row level security;

-- Allow the app (anon key) to insert rows
drop policy if exists "Allow anonymous inserts" on public.rti_applications;
create policy "Allow anonymous inserts"
  on public.rti_applications
  for insert
  to anon
  with check (true);

-- Optional: allow reading saved drafts (remove if you want insert-only)
drop policy if exists "Allow anonymous reads" on public.rti_applications;
create policy "Allow anonymous reads"
  on public.rti_applications
  for select
  to anon
  using (true);
