"use client";

import { useEffect, useState } from "react";
import { IconCalendar, IconChevronDown, IconX } from "@tabler/icons-react";
import type { Category, PaymentType, Tag } from "@/lib/types";
import type { Preset } from "./shared";

const chipClass = (active: boolean) =>
  `rounded-full border px-3 py-[6px] text-xs transition-colors ${
    active ? "border-transparent bg-[#FAC775] text-[#412402]" : "border-line text-ink-muted"
  }`;

function LightSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
}) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-none border-none bg-transparent py-1 pl-0 pr-4 text-xs text-ink-muted outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <IconChevronDown size={12} className="pointer-events-none absolute right-0 text-ink-muted" />
    </div>
  );
}

export function DesktopFilters({
  preset,
  from,
  to,
  categoryId,
  tagId,
  paymentTypeId,
  categories,
  tags,
  paymentTypes,
  showClear,
  onPreset,
  onDateChange,
  onFilterChange,
  onClear,
}: {
  preset: Preset;
  from: string;
  to: string;
  categoryId: string;
  tagId: string;
  paymentTypeId: string;
  categories: Category[];
  tags: Tag[];
  paymentTypes: PaymentType[];
  showClear: boolean;
  onPreset: (preset: Exclude<Preset, "custom">) => void;
  onDateChange: (patch: { from?: string; to?: string }) => void;
  onFilterChange: (patch: Record<string, string | null>) => void;
  onClear: () => void;
}) {
  const [customOpen, setCustomOpen] = useState(preset === "custom");

  useEffect(() => {
    setCustomOpen(preset === "custom");
  }, [preset]);

  return (
    <div className="hidden flex-wrap items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-3 md:flex">
      <button type="button" onClick={() => onPreset("hoy")} className={chipClass(preset === "hoy")}>
        Hoy
      </button>
      <button type="button" onClick={() => onPreset("semana")} className={chipClass(preset === "semana")}>
        Semana
      </button>
      <button type="button" onClick={() => onPreset("mes")} className={chipClass(preset === "mes")}>
        Este mes
      </button>
      <button
        type="button"
        onClick={() => setCustomOpen((v) => !v)}
        className={`flex items-center gap-1.5 ${chipClass(preset === "custom")}`}
      >
        <IconCalendar size={14} />
        Rango personalizado
      </button>

      {customOpen ? (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => onDateChange({ from: e.target.value })}
            className="tabular rounded-[8px] border border-line bg-card px-2 py-1 text-xs text-ink outline-none focus:border-gold"
          />
          <span className="text-ink-muted">–</span>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => onDateChange({ to: e.target.value })}
            className="tabular rounded-[8px] border border-line bg-card px-2 py-1 text-xs text-ink outline-none focus:border-gold"
          />
        </div>
      ) : null}

      <span className="h-5 w-px bg-line" aria-hidden />

      <LightSelect
        value={categoryId}
        onChange={(v) => onFilterChange({ categoryId: v || null })}
        options={categories}
        placeholder="Categoría"
      />
      <LightSelect
        value={tagId}
        onChange={(v) => onFilterChange({ tagId: v || null })}
        options={tags}
        placeholder="Etiqueta"
      />
      <LightSelect
        value={paymentTypeId}
        onChange={(v) => onFilterChange({ paymentTypeId: v || null })}
        options={paymentTypes}
        placeholder="Tipo de pago"
      />

      {showClear ? (
        <button
          type="button"
          onClick={onClear}
          className="ml-auto flex items-center gap-1 text-xs text-gold"
        >
          <IconX size={13} />
          Limpiar
        </button>
      ) : null}
    </div>
  );
}
