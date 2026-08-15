"use client";

import { useEffect, useState } from "react";
import { IconAdjustmentsHorizontal, IconX } from "@tabler/icons-react";
import { BottomSheet } from "@/components/bottom-sheet";
import type { Category, PaymentType, Tag } from "@/lib/types";
import { presetRange, type Preset } from "./shared";

const chipClass = (active: boolean) =>
  `rounded-full border px-3 py-[6px] text-xs transition-colors ${
    active ? "border-transparent bg-gold text-gold-ink" : "border-line text-ink-muted"
  }`;

const fieldClass =
  "rounded-[8px] border border-line bg-card px-[10px] py-2 text-sm text-ink outline-none focus:border-gold";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.15em] text-ink-muted">{label}</span>
      {children}
    </div>
  );
}

export function MobileFilters({
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
  onApply,
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
  onApply: (patch: Record<string, string | null>) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftPreset, setDraftPreset] = useState<Preset>(preset);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const [draftCategoryId, setDraftCategoryId] = useState(categoryId);
  const [draftTagId, setDraftTagId] = useState(tagId);
  const [draftPaymentTypeId, setDraftPaymentTypeId] = useState(paymentTypeId);

  useEffect(() => {
    if (open) {
      setDraftPreset(preset);
      setDraftFrom(from);
      setDraftTo(to);
      setDraftCategoryId(categoryId);
      setDraftTagId(tagId);
      setDraftPaymentTypeId(paymentTypeId);
    }
  }, [open, preset, from, to, categoryId, tagId, paymentTypeId]);

  function handleApply() {
    const range = draftPreset === "custom" ? { from: draftFrom, to: draftTo } : presetRange(draftPreset);
    onApply({
      from: range.from,
      to: range.to,
      categoryId: draftCategoryId || null,
      tagId: draftTagId || null,
      paymentTypeId: draftPaymentTypeId || null,
    });
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-3 md:hidden">
        <button type="button" onClick={() => onPreset("mes")} className={chipClass(preset === "mes")}>
          Este mes
        </button>
        <button type="button" onClick={() => onPreset("semana")} className={chipClass(preset === "semana")}>
          Semana
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto flex items-center gap-1.5 text-sm text-ink"
        >
          <IconAdjustmentsHorizontal size={16} className="text-gold" />
          Filtros
        </button>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[14px] font-medium text-ink">Filtros</h2>
          {showClear ? (
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="flex items-center gap-1 text-xs text-gold"
            >
              <IconX size={12} />
              Limpiar
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <Section label="Rango">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDraftPreset("mes")}
                className={chipClass(draftPreset === "mes")}
              >
                Mes
              </button>
              <button
                type="button"
                onClick={() => setDraftPreset("semana")}
                className={chipClass(draftPreset === "semana")}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => setDraftPreset("custom")}
                className={chipClass(draftPreset === "custom")}
              >
                Custom
              </button>
            </div>
            {draftPreset === "custom" ? (
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="date"
                  value={draftFrom}
                  max={draftTo}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  className={`${fieldClass} tabular flex-1`}
                />
                <span className="text-ink-muted">–</span>
                <input
                  type="date"
                  value={draftTo}
                  min={draftFrom}
                  onChange={(e) => setDraftTo(e.target.value)}
                  className={`${fieldClass} tabular flex-1`}
                />
              </div>
            ) : null}
          </Section>

          <Section label="Categoría">
            <select
              value={draftCategoryId}
              onChange={(e) => setDraftCategoryId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Section>

          <Section label="Etiqueta">
            <select
              value={draftTagId}
              onChange={(e) => setDraftTagId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Todas</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Section>

          <Section label="Tipo de pago">
            <select
              value={draftPaymentTypeId}
              onChange={(e) => setDraftPaymentTypeId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Todos</option>
              {paymentTypes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Section>

          <button
            type="button"
            onClick={handleApply}
            className="w-full rounded-[8px] bg-gold p-[10px] text-[13px] font-medium text-gold-ink"
          >
            Aplicar
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
