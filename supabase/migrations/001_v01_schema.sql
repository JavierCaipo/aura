-- ============================================================
-- Aura OS — V0.1 Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabla de perfiles (uno por usuario)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  webhook_token text unique not null default gen_random_uuid()::text,
  created_at    timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de usuario con token de webhook único';
comment on column public.profiles.webhook_token is 'Token opaco para autenticar requests del iOS Shortcut. Nunca exponer el user_id.';

-- RLS: cada usuario solo ve y modifica su propio perfil
alter table public.profiles enable row level security;

create policy "Profiles: select own" on public.profiles
  for select using (auth.uid() = id);

create policy "Profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);


-- 2. Trigger: crear perfil automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. Tabla de transacciones
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      numeric(12,2) not null check (amount > 0),
  currency    text not null default 'PEN',
  raw_text    text,
  created_at  timestamptz not null default now()
);

comment on table public.transactions is 'Gastos registrados por el iOS Shortcut vía webhook';

-- Index para queries de mes actual
create index if not exists idx_transactions_user_created
  on public.transactions (user_id, created_at desc);

-- RLS: cada usuario solo ve sus propias transacciones
alter table public.transactions enable row level security;

create policy "Transactions: select own" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Transactions: insert own" on public.transactions
  for insert with check (auth.uid() = user_id);


-- 4. Habilitar Realtime para INSERT en transactions
-- (También debes activarlo en Dashboard → Database → Replication)
alter publication supabase_realtime add table public.transactions;
