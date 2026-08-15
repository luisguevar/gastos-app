-- Gastos App — Presupuestos
-- Presupuesto = un total base (normalmente el ingreso mensual) + un reparto por
-- categoría en porcentaje. Hay valores POR DEFECTO (month = null) y, opcional,
-- overrides POR MES (month = primer día del mes). El monto por categoría se
-- calcula como percent% del total. La suma de porcentajes ≤ 100 (se valida en
-- la app). Solo cuenta el gasto personal (is_loan = false).

begin;

-- Total base: una fila por defecto (month null) + opcional una por mes.
create table if not exists public.budget_totals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  month date,
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now()
);
create unique index if not exists budget_totals_default_key
  on public.budget_totals (user_id) where month is null;
create unique index if not exists budget_totals_month_key
  on public.budget_totals (user_id, month) where month is not null;

-- Porcentaje por categoría: default (month null) + overrides por mes.
create table if not exists public.budget_percents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  month date,
  percent numeric(5, 2) not null check (percent >= 0 and percent <= 100),
  created_at timestamptz not null default now()
);
create unique index if not exists budget_percents_default_key
  on public.budget_percents (user_id, category_id) where month is null;
create unique index if not exists budget_percents_month_key
  on public.budget_percents (user_id, category_id, month) where month is not null;
create index if not exists budget_percents_user_month_idx
  on public.budget_percents (user_id, month);

alter table public.budget_totals enable row level security;
alter table public.budget_percents enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['budget_totals', 'budget_percents']
  loop
    execute format('create policy %I on public.%I for select using (auth.uid() = user_id)', 'view own ' || t, t);
    execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id)', 'insert own ' || t, t);
    execute format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', 'update own ' || t, t);
    execute format('create policy %I on public.%I for delete using (auth.uid() = user_id)', 'delete own ' || t, t);
  end loop;
end $$;

commit;
