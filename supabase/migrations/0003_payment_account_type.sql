-- Gastos App — asocia cada payment_account a un payment_type específico
-- (necesario para el nuevo selector de método de pago: las cuentas solo se
-- muestran para Transferencia/Tarjeta débito/Tarjeta crédito, filtradas por
-- ese tipo exacto). Confirmado con el usuario: payment_accounts está vacía
-- todavía, así que no hace falta backfill antes de exigir NOT NULL.

begin;

alter table public.payment_accounts
  add column if not exists payment_type_id uuid references public.payment_types (id);

do $$
declare
  existing_count integer;
begin
  select count(*) into existing_count from public.payment_accounts;
  if existing_count > 0 then
    raise exception
      'Migración abortada: hay % cuenta(s) existentes sin payment_type_id asignado. Asígnalas manualmente (UPDATE payment_accounts SET payment_type_id = ...) antes de reintentar.',
      existing_count;
  end if;
end $$;

alter table public.payment_accounts
  alter column payment_type_id set not null;

create index if not exists payment_accounts_payment_type_id_idx on public.payment_accounts (payment_type_id);

commit;
