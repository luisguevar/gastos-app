-- Gastos App — migración "Bóveda" ampliada
-- Categorías, etiquetas, tipos de pago, cuentas/tarjetas, y su cableado a expenses.
-- Ejecutar una sola vez en el SQL Editor de Supabase, sobre un proyecto que ya
-- corrió supabase/schema.sql (el schema inicial con la tabla expenses).

begin;

-- =========================================================================
-- 1. Tablas de catálogo por usuario: categories, tags, payment_types,
--    payment_accounts. Mismo patrón que expenses: user_id + RLS por
--    auth.uid(). "activa" es borrado lógico — nunca se hace DELETE real
--    de estas filas desde la app, solo se desactivan/reactivan.
-- =========================================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists categories_user_id_idx on public.categories (user_id);
create index if not exists tags_user_id_idx on public.tags (user_id);
create index if not exists payment_types_user_id_idx on public.payment_types (user_id);
create index if not exists payment_accounts_user_id_idx on public.payment_accounts (user_id);

-- Unicidad insensible a mayúsculas/minúsculas y espacios: "Comida" y "comida "
-- (creadas al vuelo desde el formulario) deben chocar como la misma fila,
-- no convivir como dos categorías distintas.
create unique index if not exists categories_user_id_name_key
  on public.categories (user_id, lower(btrim(name)));
create unique index if not exists tags_user_id_name_key
  on public.tags (user_id, lower(btrim(name)));
create unique index if not exists payment_types_user_id_name_key
  on public.payment_types (user_id, lower(btrim(name)));
create unique index if not exists payment_accounts_user_id_name_key
  on public.payment_accounts (user_id, lower(btrim(name)));

alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.payment_types enable row level security;
alter table public.payment_accounts enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['categories', 'tags', 'payment_types', 'payment_accounts']
  loop
    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id)',
      'Users can view their own ' || t, t
    );
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id)',
      'Users can insert their own ' || t, t
    );
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      'Users can update their own ' || t, t
    );
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id)',
      'Users can delete their own ' || t, t
    );
  end loop;
end $$;

-- =========================================================================
-- 2. Seed automático para usuarios nuevos: trigger en auth.users.
--    Necesario porque esta app es login-only (usuarios creados a mano desde
--    el dashboard de Supabase) — no hay un paso de "signup" en la app donde
--    enganchar un seed inicial. El trigger garantiza que las categorías,
--    tipos de pago y la etiqueta "Personal" existan apenas se crea la cuenta,
--    sin importar quién la cree (dashboard, API, o la app).
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name)
  values
    (new.id, 'Comida'), (new.id, 'Transporte'), (new.id, 'Vivienda'),
    (new.id, 'Entretenimiento'), (new.id, 'Salud'), (new.id, 'Compras'),
    (new.id, 'Servicios'), (new.id, 'Otros')
  on conflict (user_id, lower(btrim(name))) do nothing;

  insert into public.payment_types (user_id, name)
  values
    (new.id, 'Efectivo'), (new.id, 'Yape'), (new.id, 'Plin'),
    (new.id, 'Transferencia'), (new.id, 'Tarjeta débito'), (new.id, 'Tarjeta crédito')
  on conflict (user_id, lower(btrim(name))) do nothing;

  insert into public.tags (user_id, name)
  values (new.id, 'Personal')
  on conflict (user_id, lower(btrim(name))) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- 3. Backfill del mismo seed para usuarios que ya existen (el trigger de
--    arriba solo corre para altas futuras).
-- =========================================================================

insert into public.categories (user_id, name)
select u.id, c.name
from auth.users u
cross join (values
  ('Comida'), ('Transporte'), ('Vivienda'), ('Entretenimiento'),
  ('Salud'), ('Compras'), ('Servicios'), ('Otros')
) as c(name)
on conflict (user_id, lower(btrim(name))) do nothing;

insert into public.payment_types (user_id, name)
select u.id, p.name
from auth.users u
cross join (values
  ('Efectivo'), ('Yape'), ('Plin'),
  ('Transferencia'), ('Tarjeta débito'), ('Tarjeta crédito')
) as p(name)
on conflict (user_id, lower(btrim(name))) do nothing;

insert into public.tags (user_id, name)
select u.id, 'Personal'
from auth.users u
on conflict (user_id, lower(btrim(name))) do nothing;

-- =========================================================================
-- 4. expenses: migrar category (text + check) → category_id (uuid, FK).
--    Se agrega la columna, se rellena por nombre, se exige NOT NULL y
--    recién ahí se elimina la columna vieja (el DROP se lleva su CHECK
--    de encima automáticamente).
-- =========================================================================

alter table public.expenses
  add column if not exists category_id uuid references public.categories (id);

-- Comparación normalizada (trim + case-insensitive): un valor viejo como
-- "comida " o "COMIDA" por un bug o entrada manual no debe quedar sin
-- categoría asignada solo porque el string no calza exacto.
update public.expenses e
set category_id = c.id
from public.categories c
where c.user_id = e.user_id
  and lower(btrim(c.name)) = lower(btrim(e.category))
  and e.category_id is null;

-- Freno de seguridad: si algo no pudo mapearse, abortamos ANTES del commit
-- en vez de dejar la columna NOT NULL fallar (o peor, perder el dato de
-- qué categoría tenía ese gasto, una vez que se borre la columna vieja).
do $$
declare
  missing_count integer;
begin
  select count(*) into missing_count from public.expenses where category_id is null;
  if missing_count > 0 then
    raise exception
      'Migración abortada: % gasto(s) no se pudieron mapear a una categoría existente (revisa expenses.category para valores inesperados antes de reintentar).',
      missing_count;
  end if;
end $$;

alter table public.expenses
  alter column category_id set not null;

alter table public.expenses
  drop column if exists category;

-- =========================================================================
-- 5. expenses: payment_type_id (obligatorio) y payment_account_id (opcional).
--    Backfill de payment_type_id → "Efectivo" para gastos históricos (no
--    sabemos cómo se pagaron realmente; ajusta manualmente si hace falta).
-- =========================================================================

alter table public.expenses
  add column if not exists payment_type_id uuid references public.payment_types (id);

alter table public.expenses
  add column if not exists payment_account_id uuid references public.payment_accounts (id) on delete set null;

update public.expenses e
set payment_type_id = pt.id
from public.payment_types pt
where pt.user_id = e.user_id
  and lower(btrim(pt.name)) = 'efectivo'
  and e.payment_type_id is null;

do $$
declare
  missing_count integer;
begin
  select count(*) into missing_count from public.expenses where payment_type_id is null;
  if missing_count > 0 then
    raise exception
      'Migración abortada: % gasto(s) quedaron sin payment_type_id (no se encontró "Efectivo" para ese usuario).',
      missing_count;
  end if;
end $$;

alter table public.expenses
  alter column payment_type_id set not null;

create index if not exists expenses_category_id_idx on public.expenses (category_id);
create index if not exists expenses_payment_type_id_idx on public.expenses (payment_type_id);
create index if not exists expenses_payment_account_id_idx on public.expenses (payment_account_id);

-- =========================================================================
-- 6. expense_tags: relación muchos a muchos entre expenses y tags.
--    Sin user_id propio — el RLS valida a través del expense/tag dueño.
--    Backfill: todo gasto histórico queda etiquetado como "Personal".
-- =========================================================================

create table if not exists public.expense_tags (
  expense_id uuid not null references public.expenses (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (expense_id, tag_id)
);

create index if not exists expense_tags_tag_id_idx on public.expense_tags (tag_id);

alter table public.expense_tags enable row level security;

create policy "Users can view their own expense_tags"
  on public.expense_tags for select
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_tags.expense_id and e.user_id = auth.uid()
    )
  );

create policy "Users can insert their own expense_tags"
  on public.expense_tags for insert
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_tags.expense_id and e.user_id = auth.uid()
    )
    and exists (
      select 1 from public.tags t
      where t.id = expense_tags.tag_id and t.user_id = auth.uid()
    )
  );

create policy "Users can delete their own expense_tags"
  on public.expense_tags for delete
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_tags.expense_id and e.user_id = auth.uid()
    )
  );

insert into public.expense_tags (expense_id, tag_id)
select e.id, t.id
from public.expenses e
join public.tags t on t.user_id = e.user_id and t.name = 'Personal'
on conflict do nothing;

commit;
