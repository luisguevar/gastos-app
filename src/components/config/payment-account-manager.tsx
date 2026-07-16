"use client";

import { useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createPaymentAccount, setPaymentAccountActive, type CatalogActionState } from "@/app/actions/catalogs";
import type { PaymentAccount, PaymentType } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-[8px] border border-line px-3 py-2 text-xs uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-gold hover:text-ink disabled:opacity-40"
    >
      {pending ? "Creando…" : "+ Crear"}
    </button>
  );
}

export function PaymentAccountManager({
  items,
  paymentTypes,
}: {
  items: PaymentAccount[];
  paymentTypes: PaymentType[];
}) {
  const [state, formAction] = useFormState<CatalogActionState, FormData>(createPaymentAccount, {});
  const [isPending, startTransition] = useTransition();

  const typeName = (id: string) => paymentTypes.find((t) => t.id === id)?.name ?? "Sin tipo";
  const sorted = [...items].sort((a, b) => Number(b.activa) - Number(a.activa));

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-wrap gap-2">
        <input
          name="name"
          type="text"
          placeholder="Nueva cuenta o tarjeta…"
          required
          className="min-w-[10rem] flex-1 rounded-[8px] border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-gold"
        />
        <select
          name="payment_type_id"
          required
          defaultValue=""
          className="rounded-[8px] border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-gold"
        >
          <option value="" disabled>
            Tipo de pago
          </option>
          {paymentTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.name}
            </option>
          ))}
        </select>
        <SubmitButton />
      </form>
      {state.error ? (
        <p className="text-xs text-danger-ink" role="alert">
          {state.error}
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-muted">Sin registros todavía.</p>
      ) : (
        <ul className="flex flex-col">
          {sorted.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-dashed border-line py-2.5 last:border-b-0"
            >
              <span className="flex min-w-0 flex-col">
                <span className={`text-sm ${item.activa ? "text-ink" : "text-ink-muted line-through"}`}>
                  {item.name}
                </span>
                <span className="text-[11px] text-ink-muted">{typeName(item.payment_type_id)}</span>
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => setPaymentAccountActive(item.id, !item.activa))
                }
                className={`shrink-0 rounded-[8px] border px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] transition-colors disabled:opacity-40 ${
                  item.activa
                    ? "border-line text-ink-muted hover:border-danger hover:text-danger-ink"
                    : "border-gold text-gold hover:bg-gold/10"
                }`}
              >
                {item.activa ? "Desactivar" : "Reactivar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
