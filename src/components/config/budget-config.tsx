"use client";

import { useState, useTransition } from "react";
import { IconCheck } from "@tabler/icons-react";
import { iconByKey } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/format";
import { saveDefaultBudget, type PercentEntry } from "@/app/actions/budgets";
import { Spinner } from "@/components/loader";
import type { Category } from "@/lib/types";

const round2 = (n: number) => Math.round(n * 100) / 100;

export function BudgetConfig({
  categories,
  defaultTotal,
  defaultPercents,
}: {
  categories: Category[];
  defaultTotal: number;
  defaultPercents: Record<string, number>;
}) {
  const [total, setTotal] = useState(defaultTotal);
  const [percents, setPercents] = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {};
    for (const c of categories) o[c.id] = defaultPercents[c.id] ?? 0;
    return o;
  });
  const [isPending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sum = round2(Object.values(percents).reduce((s, v) => s + (v || 0), 0));
  const over = sum > 100.001;
  const assigned = round2((sum / 100) * total);
  const sinPct = round2(100 - sum);

  function setPct(id: string, v: number) {
    setPercents((p) => ({ ...p, [id]: Number.isFinite(v) ? v : 0 }));
    setSaved(false);
  }
  function setAmt(id: string, amount: number) {
    setPct(id, total > 0 ? round2((amount / total) * 100) : 0);
  }

  function save() {
    setError(null);
    const entries: PercentEntry[] = categories.map((c) => ({ categoryId: c.id, percent: percents[c.id] || 0 }));
    start(async () => {
      const res = await saveDefaultBudget(total, entries);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
    });
  }

  const fieldPct =
    "w-14 rounded-[8px] border border-line bg-card px-2 py-1.5 text-right text-sm font-medium text-ink outline-none focus:border-gold tabular";
  const fieldAmt =
    "w-24 rounded-[8px] border border-line bg-card px-2 py-1.5 text-right text-sm text-ink outline-none focus:border-gold tabular";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Ingreso mensual (presupuesto base)
        </label>
        <p className="mt-1 text-xs text-ink-muted">
          Es la base sobre la que se reparten los porcentajes. Normalmente tu ingreso del mes.
        </p>
        <div className="mt-2 flex items-center gap-2 rounded-[10px] border border-line bg-card px-3 py-2 w-fit">
          <span className="text-sm text-ink-muted">S/</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={total}
            onChange={(e) => {
              setTotal(Number(e.target.value) || 0);
              setSaved(false);
            }}
            className="font-display tabular w-32 border-0 bg-transparent text-right text-xl font-bold text-ink outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink">Reparto por categoría</h3>
        <p className="mb-2 mt-0.5 text-xs text-ink-muted">
          Asigna un % a cada categoría; el monto se calcula solo (o escribe el monto y calcula el %). La suma no puede pasar de 100%.
        </p>
        <ul className="flex flex-col">
          {categories.map((c) => {
            const Icon = iconByKey(c.icon);
            const pct = percents[c.id] || 0;
            const amt = round2((pct / 100) * total);
            return (
              <li key={c.id} className="flex items-center gap-3 border-b border-dashed border-line py-2.5 last:border-b-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gold/10 text-gold">
                  <Icon size={16} />
                </span>
                <span className="flex-1 truncate text-sm text-ink">{c.name}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={pct}
                    onChange={(e) => setPct(c.id, Number(e.target.value) || 0)}
                    className={fieldPct}
                  />
                  <span className="text-xs text-ink-muted">%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-ink-muted">S/</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amt}
                    onChange={(e) => setAmt(c.id, Number(e.target.value) || 0)}
                    className={fieldAmt}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 border-t border-line pt-4">
          <div className="h-2.5 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, sum)}%`,
                backgroundImage: over ? "linear-gradient(90deg,#f87171,#c81e1e)" : "var(--grad-verde)",
              }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-[13px]">
            <span className={over ? "font-semibold text-danger-ink" : "text-ink"}>
              Asignado <b className="tabular">{sum}%</b> · <b className="tabular">{formatCurrency(assigned)}</b>
            </span>
            <span className="text-ink-muted">
              Sin asignar <b className="tabular text-ink">{sinPct < 0 ? 0 : sinPct}%</b> ·{" "}
              {formatCurrency(round2(((sinPct < 0 ? 0 : sinPct) / 100) * total))}
            </span>
          </div>
          {over ? (
            <p className="mt-2 text-xs text-danger-ink" role="alert">
              La suma supera el 100%. Ajusta antes de guardar.
            </p>
          ) : null}
          {error ? (
            <p className="mt-2 text-xs text-danger-ink" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={save}
            disabled={over || isPending}
            className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-gold px-4 py-2 text-sm font-semibold text-gold-ink transition-colors hover:bg-gold-hover disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Spinner className="h-4 w-4" /> Guardando…
              </>
            ) : saved ? (
              <>
                <IconCheck size={16} /> Guardado
              </>
            ) : (
              "Guardar por defecto"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
