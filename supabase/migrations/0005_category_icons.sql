-- Gastos App — íconos de categoría (editables)
-- Agrega columna icon a categories, hace backfill por nombre para las
-- categorías existentes, y actualiza el seed (trigger de altas) para que las
-- categorías por defecto nazcan ya con su ícono. Las categorías sin ícono
-- usan un ícono por defecto en la app (como "Otros").

begin;

alter table public.categories add column if not exists icon text;

-- Backfill de íconos por nombre normalizado (solo donde aún es null).
update public.categories set icon = 'comida'
  where icon is null and lower(btrim(name)) in ('comida','comidas','alimentacion','alimentación');
update public.categories set icon = 'transporte'
  where icon is null and lower(btrim(name)) in ('transporte','movilidad','pasajes','pasaje');
update public.categories set icon = 'vivienda'
  where icon is null and lower(btrim(name)) in ('vivienda','hogar','casa','alquiler','renta');
update public.categories set icon = 'entretenimiento'
  where icon is null and lower(btrim(name)) in ('entretenimiento','ocio','diversion','diversión');
update public.categories set icon = 'salud'
  where icon is null and lower(btrim(name)) in ('salud','medicina','medico','médico');
update public.categories set icon = 'compras'
  where icon is null and lower(btrim(name)) in ('compras','shopping','ropa');
update public.categories set icon = 'servicios'
  where icon is null and lower(btrim(name)) in ('servicios','servicio','luz','agua','internet');
update public.categories set icon = 'otros'
  where icon is null and lower(btrim(name)) in ('otros','otro','varios');

-- Seed para cuentas nuevas: categorías por defecto con su ícono.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, icon)
  values
    (new.id, 'Comida', 'comida'), (new.id, 'Transporte', 'transporte'),
    (new.id, 'Vivienda', 'vivienda'), (new.id, 'Entretenimiento', 'entretenimiento'),
    (new.id, 'Salud', 'salud'), (new.id, 'Compras', 'compras'),
    (new.id, 'Servicios', 'servicios'), (new.id, 'Otros', 'otros')
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

commit;
