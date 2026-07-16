"use client";

import { useMemo, useState, useTransition } from "react";
import { createTagInline } from "@/app/actions/catalogs";
import type { Tag } from "@/lib/types";

export function TagMultiSelect({
  allTags,
  defaultSelectedIds = [],
}: {
  allTags: Tag[];
  defaultSelectedIds?: string[];
}) {
  const [tags, setTags] = useState<Tag[]>(allTags);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultSelectedIds)
  );
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const draftTrimmed = draft.trim();
  const matchExisting = useMemo(
    () =>
      tags.some((t) => t.name.toLowerCase() === draftTrimmed.toLowerCase()),
    [tags, draftTrimmed]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCreate() {
    if (!draftTrimmed || matchExisting) return;
    setError(null);
    startTransition(async () => {
      const result = await createTagInline(draftTrimmed);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setTags((prev) => [...prev, { ...result, activa: true }]);
      setSelected((prev) => new Set(prev).add(result.id));
      setDraft("");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
        Etiquetas
      </span>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selected.has(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                active
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-line text-ink-muted hover:border-ink hover:text-ink"
              }`}
            >
              {tag.name}
            </button>
          );
        })}
      </div>

      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name="tag_ids" value={id} />
      ))}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
          placeholder="Nueva etiqueta…"
          className="flex-1 rounded-[8px] border border-line bg-card px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-gold"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!draftTrimmed || matchExisting || isPending}
          className="shrink-0 rounded-[8px] border border-line px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-gold hover:text-ink disabled:opacity-40"
        >
          {isPending ? "Creando…" : "+ Crear"}
        </button>
      </div>

      {error ? (
        <p className="text-xs text-danger-ink" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
