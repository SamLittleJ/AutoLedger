-- Expenses belong to a vehicle; ownership is checked through the vehicle
-- (docs/PLAN.md §5, §6, D1, D3). No user_id column on purpose.

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null
    references public.vehicles (id) on delete cascade,
  performed_on date not null,
  category text not null check (
    category in ('service', 'repair', 'consumables', 'fuel', 'accessories', 'other')
  ),
  description text not null check (btrim(description) <> ''),
  odometer integer check (odometer >= 0),
  cost numeric(10, 2) not null check (cost >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create index expenses_vehicle_id_idx on public.expenses (vehicle_id);

alter table public.expenses enable row level security;

-- Table privileges: anon gets nothing; authenticated can read, insert, delete
-- and update only the editable columns. vehicle_id is not updatable (one
-- vehicle per user); the UPDATE policy's WITH CHECK still guards it.
revoke all on table public.expenses from anon, authenticated;
grant select, insert, delete on table public.expenses to authenticated;
grant update (performed_on, category, description, odometer, cost, notes)
  on table public.expenses to authenticated;

create policy "expenses_select_own"
  on public.expenses for select
  to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = expenses.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

create policy "expenses_insert_own"
  on public.expenses for insert
  to authenticated
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = expenses.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

create policy "expenses_update_own"
  on public.expenses for update
  to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = expenses.vehicle_id
        and v.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = expenses.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

create policy "expenses_delete_own"
  on public.expenses for delete
  to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = expenses.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

-- Raise the vehicle's odometer when an expense reports a higher reading (D1).
-- SECURITY INVOKER (the default) so RLS on vehicles still applies. It never
-- lowers the odometer and does nothing when the expense has no reading.
create function public.bump_vehicle_odometer()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.odometer is not null then
    update public.vehicles
    set current_odometer = new.odometer
    where id = new.vehicle_id
      and current_odometer < new.odometer;
  end if;
  return null;
end;
$$;

revoke execute on function public.bump_vehicle_odometer() from public, anon;

create trigger expenses_bump_vehicle_odometer
  after insert or update of odometer on public.expenses
  for each row
  execute function public.bump_vehicle_odometer();
