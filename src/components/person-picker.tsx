"use client";

import { useMemo, useState, useTransition } from "react";
import { createPersonInline } from "@/app/actions/catalogs";
import type { Person } from "@/lib/types";

export function PersonPicker({
  allPeople,
  defaultSelectedId = null,
}: {
  allPeople: Person[];
  defaultSelectedId?: string | null;
}) {
  const [people, setPeople] = useState<Person[]>(allPeople);
  const [selected, setSelected] = useState<string | null>(defaultSelectedId);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const draftTrimmed = draft.trim();
  const matchExisting = useMemo(
    () => people.some((p) => p.name.toLowerCase() === draftTrimmed.toLowerCase()),
    [people, draftTrimmed]
  );

  function handleCreate() {
    if (!draftTrimmed || matchExisting) return;
    setError(null);
    startTransition(async () => {
      const result = await createPersonInline(draftTrimmed);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setPeople((prev) => [...prev, { ...result, activa: true }]);
      setSelected(result.id);
      setDraft("");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
        A quién le prestaste
      </span>

      {people.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {people.map((person) => {
            const active = selected === person.id;
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => setSelected(active ? null : person.id)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-line text-ink-muted hover:border-ink hover:text-ink"
                }`}
              >
                {person.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <input type="hidden" name="loan_person_id" value={selected ?? ""} />

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
          placeholder="Nueva persona…"
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
