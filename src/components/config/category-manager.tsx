"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CatalogNameEditor } from "@/components/config/catalog-name-editor";
import { IconPicker } from "@/components/config/icon-picker";
import type { Category } from "@/lib/types";
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

export function CategoryManager({
  items,
  createAction,
  toggleAction,
  renameAction,
  setIconAction,
}: {
  items: Category[];
  createAction: (prev: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  toggleAction: (id: string, activa: boolean) => Promise<void>;
  renameAction: (id: string, name: string) => Promise<CatalogActionState>;
  setIconAction: (id: string, icon: string) => Promise<void>;
}) {
  const [state, formAction] = useFormState(createAction, {});
  const [isPending, startTransition] = useTransition();
  const [newIcon, setNewIcon] = useState("otros");

  const sorted = [...items].sort((a, b) => Number(b.activa) - Number(a.activa));

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex items-center gap-2">
        <IconPicker value={newIcon} onChange={setNewIcon} />
        <input type="hidden" name="icon" value={newIcon} />
        <input
          name="name"
          type="text"
          placeholder="Nueva categoría…"
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
              className="flex items-center gap-3 border-b border-dashed border-line py-2.5 last:border-b-0"
            >
              <IconPicker
                value={item.icon}
                disabled={isPending}
                onChange={(key) => startTransition(() => setIconAction(item.id, key))}
              />
              <CatalogNameEditor
                id={item.id}
                name={item.name}
                activa={item.activa}
                renameAction={renameAction}
              />
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
