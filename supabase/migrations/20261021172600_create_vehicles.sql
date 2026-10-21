-- One vehicle per user (docs/PLAN.md §5, §6).

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid()
    references auth.users (id) on delete cascade,
  make text not null check (btrim(make) <> ''),
  model text not null check (btrim(model) <> ''),
  year smallint check (year between 1900 and 2100),
  current_odometer integer not null default 0 check (current_odometer >= 0),
  created_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

-- Table privileges: anon gets nothing; authenticated can read, insert and
-- update only the editable columns (no delete in scope).
revoke all on table public.vehicles from anon, authenticated;
grant select, insert on table public.vehicles to authenticated;
grant update (make, model, year, current_odometer) on table public.vehicles to authenticated;

create policy "vehicles_select_own"
  on public.vehicles for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "vehicles_insert_own"
  on public.vehicles for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "vehicles_update_own"
  on public.vehicles for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
