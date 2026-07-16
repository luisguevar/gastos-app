"use client";

import { useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { Catalog } from "@/lib/types";
import type { CatalogActionState } from "@/app/actions/catalogs";

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

export function CatalogManager({
  items,
  createAction,
  toggleAction,
  placeholder,
}: {
  items: Catalog[];
  createAction: (
    prev: CatalogActionState,
    formData: FormData
  ) => Promise<CatalogActionState>;
  toggleAction: (id: string, activa: boolean) => Promise<void>;
  placeholder: string;
}) {
  const [state, formAction] = useFormState(createAction, {});
  const [isPending, startTransition] = useTransition();

  const sorted = [...items].sort((a, b) => Number(b.activa) - Number(a.activa));

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex gap-2">
        <input
          name="name"
          type="text"
          placeholder={placeholder}
          required
          className="flex-1 rounded-[8px] border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-gold"
        />
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
              <span className={`text-sm ${item.activa ? "text-ink" : "text-ink-muted line-through"}`}>
                {item.name}
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => toggleAction(item.id, !item.activa))}
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
