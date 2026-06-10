create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.app_state enable row level security;

drop policy if exists "public can read app_state" on public.app_state;
create policy "public can read app_state"
on public.app_state
for select
to anon, authenticated
using (true);

drop policy if exists "public can write app_state" on public.app_state;
create policy "public can write app_state"
on public.app_state
for insert
to anon, authenticated
with check (true);

drop policy if exists "public can update app_state" on public.app_state;
create policy "public can update app_state"
on public.app_state
for update
to anon, authenticated
using (true)
with check (true);
