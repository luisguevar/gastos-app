-- Gastos App — schema inicial
-- Ejecutar en el SQL Editor de Supabase (proyecto ya creado).
-- Auth: usa Supabase Auth con email/contraseña. Esta app es de login-only,
-- así que los usuarios se crean manualmente desde el dashboard de Supabase
-- (Authentication > Users > Add user), no hay endpoint público de registro.

create extension if not exists "pgcrypto";

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  amount numeric(10, 2) not null check (amount > 0),
  category text not null check (
    category in (
      'Comida',
      'Transporte',
      'Vivienda',
      'Entretenimiento',
      'Salud',
      'Compras',
      'Servicios',
      'Otros'
    )
  ),
  description text,
  expense_date date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now()
);

comment on table public.expenses is 'Gastos personales registrados por cada usuario.';

create index if not exists expenses_user_id_idx on public.expenses (user_id);
create index if not exists expenses_expense_date_idx on public.expenses (expense_date desc);
create index if not exists expenses_user_date_idx on public.expenses (user_id, expense_date desc);

-- Row Level Security: cada usuario solo ve y modifica sus propios gastos.
alter table public.expenses enable row level security;

create policy "Users can view their own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on public.expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
