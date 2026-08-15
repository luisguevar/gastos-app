"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_ICONS, iconByKey } from "@/lib/category-icons";

export function IconPicker({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (key: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Current = iconByKey(value);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-label="Elegir ícono"
        className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-line bg-card text-gold transition-colors hover:border-gold disabled:opacity-40"
      >
        <Current size={18} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 grid w-[236px] grid-cols-6 gap-1 rounded-xl border border-line bg-card p-2 shadow-lg">
          {CATEGORY_ICONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              title={label}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors ${
                value === key ? "bg-gold/15 text-gold" : "text-ink-muted hover:bg-bg hover:text-ink"
              }`}
            >
              <Icon size={17} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
