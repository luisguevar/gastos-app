-- Gastos App — Préstamos
-- Un préstamo es un gasto (expenses) marcado con is_loan, con un deudor
-- (people) y un estado pagado/pendiente. Reutiliza categoría, etiquetas,
-- descripción y fuente (payment_type / payment_account) del gasto.
-- Ejecutar una sola vez en el SQL Editor de Supabase, sobre un proyecto que
-- ya corrió las migraciones anteriores.

begin;

-- =========================================================================
-- 1. Catálogo de personas (deudores). Mismo patrón que los demás catálogos:
--    por usuario, RLS por auth.uid(), "activa" = borrado lógico, único por
--    nombre normalizado.
-- =========================================================================
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists people_user_id_idx on public.people (user_id);
create unique index if not exists people_user_id_name_key
  on public.people (user_id, lower(btrim(name)));

alter table public.people enable row level security;

create policy "Users can view their own people"
  on public.people for select using (auth.uid() = user_id);
create policy "Users can insert their own people"
  on public.people for insert with check (auth.uid() = user_id);
create policy "Users can update their own people"
  on public.people for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own people"
  on public.people for delete using (auth.uid() = user_id);

-- =========================================================================
-- 2. Campos de préstamo en expenses. is_loan arranca en false para todos los
--    gastos existentes (default), así que no hace falta backfill.
-- =========================================================================
alter table public.expenses
  add column if not exists is_loan boolean not null default false,
  add column if not exists loan_person_id uuid references public.people (id) on delete set null,
  add column if not exists loan_paid boolean not null default false,
  add column if not exists loan_paid_date date;

create index if not exists expenses_is_loan_idx on public.expenses (user_id, is_loan);
create index if not exists expenses_loan_person_id_idx on public.expenses (loan_person_id);

commit;
