"use client";

import { useState, useTransition } from "react";
import { IconCheck, IconPencil, IconX } from "@tabler/icons-react";
import type { CatalogActionState } from "@/app/actions/catalogs";

export function CatalogNameEditor({
  id,
  name,
  activa,
  renameAction,
}: {
  id: string;
  name: string;
  activa: boolean;
  renameAction: (id: string, name: string) => Promise<CatalogActionState>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEdit() {
    setValue(name);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  function save() {
    startTransition(async () => {
      const result = await renameAction(id, value);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      setError(null);
    });
  }

  if (editing) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            disabled={isPending}
            className="min-w-0 flex-1 rounded-[8px] border border-line bg-card px-2 py-1 text-sm text-ink outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            aria-label="Guardar"
            className="shrink-0 text-gold transition-colors hover:text-gold-hover disabled:opacity-40"
          >
            <IconCheck size={16} />
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={isPending}
            aria-label="Cancelar"
            className="shrink-0 text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            <IconX size={16} />
          </button>
        </div>
        {error ? (
          <span className="text-xs text-danger-ink" role="alert">
            {error}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <span className="flex min-w-0 flex-1 items-center gap-1.5">
      <span className={`truncate text-sm ${activa ? "text-ink" : "text-ink-muted line-through"}`}>
        {name}
      </span>
      <button
        type="button"
        onClick={startEdit}
        aria-label={`Editar ${name}`}
        className="shrink-0 text-ink-muted opacity-60 transition-opacity hover:text-ink hover:opacity-100"
      >
        <IconPencil size={14} />
      </button>
    </span>
  );
}
