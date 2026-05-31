-- RTI-Ease: Adaptive questionnaire storage (Feature 3)
-- Run in Supabase Dashboard → SQL Editor after supabase/user-profiles.sql

create table if not exists public.rti_specific_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  rti_category text not null check (
    rti_category in (
      'transparency_issue',
      'personal_information',
      'public_service_complaint',
      'environmental_issue',
      'infrastructure_complaint'
    )
  ),
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, rti_category)
);

create index if not exists idx_rti_specific_details_user_id
  on public.rti_specific_details (user_id);

create or replace function public.set_rti_specific_details_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rti_specific_details_updated_at on public.rti_specific_details;
create trigger rti_specific_details_updated_at
  before update on public.rti_specific_details
  for each row
  execute function public.set_rti_specific_details_updated_at();

alter table public.rti_specific_details enable row level security;

drop policy if exists "Users can read own rti specific details" on public.rti_specific_details;
create policy "Users can read own rti specific details"
  on public.rti_specific_details for select to anon
  using (true);

drop policy if exists "Users can insert own rti specific details" on public.rti_specific_details;
create policy "Users can insert own rti specific details"
  on public.rti_specific_details for insert to anon
  with check (true);

drop policy if exists "Users can update own rti specific details" on public.rti_specific_details;
create policy "Users can update own rti specific details"
  on public.rti_specific_details for update to anon
  using (true)
  with check (true);

-- Allow updates on user_details for edit/delete flows (Feature 4)
drop policy if exists "Users can delete own details" on public.user_details;
-- soft delete uses update; covered by existing update policy
