"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import type { Catalog } from "@/lib/types";

export function TagMultiFilter({
  tags,
  selected,
  mode,
  onChange,
}: {
  tags: Catalog[];
  selected: string[];
  mode: string;
  onChange: (selected: string[], mode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const selectedSet = new Set(selected);
  const label =
    selected.length === 0
      ? "Etiqueta"
      : selected.length === 1
        ? tags.find((t) => t.id === selected[0])?.name ?? "1 etiqueta"
        : `${selected.length} etiquetas`;

  function toggle(id: string) {
    const next = selectedSet.has(id) ? selected.filter((x) => x !== id) : [...selected, id];
    onChange(next, mode);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-[9px] border border-line bg-card px-3 py-2 text-xs transition-colors hover:border-gold"
      >
        <span className={selected.length ? "text-ink" : "text-ink-muted"}>{label}</span>
        <IconChevronDown size={14} className="text-ink-muted" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-line bg-card p-2 shadow-lg">
          {selected.length > 1 ? (
            <div className="mb-2 flex rounded-[8px] bg-bg p-[3px] text-[11px]">
              <button
                type="button"
                onClick={() => onChange(selected, "any")}
                className={`flex-1 rounded-[6px] px-2 py-1 transition-colors ${
                  mode !== "all" ? "bg-card font-semibold text-ink shadow-sm" : "text-ink-muted"
                }`}
              >
                Con alguna
              </button>
              <button
                type="button"
                onClick={() => onChange(selected, "all")}
                className={`flex-1 rounded-[6px] px-2 py-1 transition-colors ${
                  mode === "all" ? "bg-card font-semibold text-ink shadow-sm" : "text-ink-muted"
                }`}
              >
                Con todas
              </button>
            </div>
          ) : null}

          <div className="max-h-56 overflow-y-auto">
            {tags.length === 0 ? (
              <p className="px-2 py-2 text-xs text-ink-muted">Sin etiquetas.</p>
            ) : (
              tags.map((t) => {
                const on = selectedSet.has(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    className={`flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-sm transition-colors ${
                      on ? "text-ink" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                        on ? "border-gold bg-gold text-gold-ink" : "border-line"
                      }`}
                    >
                      {on ? <IconCheck size={12} /> : null}
                    </span>
                    <span className="truncate">{t.name}</span>
                  </button>
                );
              })
            )}
          </div>

          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => onChange([], mode)}
              className="mt-1 w-full rounded-[8px] px-2 py-1.5 text-left text-xs text-ink-muted transition-colors hover:text-ink"
            >
              Limpiar selección
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
