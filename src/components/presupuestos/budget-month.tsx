"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconRotate, IconChevronDown } from "@tabler/icons-react";
import { iconByKey } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/format";
import { saveMonthBudget, resetMonthBudget, type PercentEntry } from "@/app/actions/budgets";
import { Spinner } from "@/components/loader";

const round2 = (n: number) => Math.round(n * 100) / 100;

export type BudgetCatRow = {
  id: string;
  name: string;
  icon: string | null;
  percent: number;
  spent: number;
};

export function BudgetMonth({
  month,
  monthLabel,
  rows,
  total: initialTotal,
  spentTotal,
  overridden,
  isCurrent,
  daysLeft,
  projected,
}: {
  month: string;
  monthLabel: string;
  rows: BudgetCatRow[];
  total: number;
  spentTotal: number;
  overridden: boolean;
  isCurrent: boolean;
  daysLeft: number;
  projected: number | null;
}) {
  const router = useRouter();
  const [total, setTotal] = useState(initialTotal);
  const [percents, setPercents] = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {};
    for (const r of rows) o[r.id] = r.percent;
    return o;
  });
  const [isPending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnbudgeted, setShowUnbudgeted] = useState(false);

  const sum = round2(Object.values(percents).reduce((s, v) => s + (v || 0), 0));
  const over = sum > 100.001;
  const restante = round2(total - spentTotal);
  const overallPct = total > 0 ? (spentTotal / total) * 100 : 0;

  // La división se hace por el valor inicial (props) para que las filas no
  // "salten" de sección mientras editas.
  const budgetedRows = rows.filter((r) => r.percent > 0);
  const unbudgetedRows = rows.filter((r) => r.percent <= 0);
  const spentUnbudgeted = round2(unbudgetedRows.reduce((s, r) => s + r.spent, 0));

  function setPct(id: string, v: number) {
    setPercents((p) => ({ ...p, [id]: Number.isFinite(v) ? v : 0 }));
    setSaved(false);
  }
  function setAmt(id: string, amount: number) {
    setPct(id, total > 0 ? round2((amount / total) * 100) : 0);
  }

  function save() {
    setError(null);
    const entries: PercentEntry[] = rows.map((r) => ({ categoryId: r.id, percent: percents[r.id] || 0 }));
    start(async () => {
      const res = await saveMonthBudget(month, total, entries);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }
  function reset() {
    start(async () => {
      await resetMonthBudget(month);
      router.refresh();
    });
  }

  const projOver = projected !== null && projected > total;

  function renderRow(r: BudgetCatRow) {
    const Icon = iconByKey(r.icon);
    const pct = percents[r.id] || 0;
    const amt = round2((pct / 100) * total);
    const usedPct = amt > 0 ? (r.spent / amt) * 100 : r.spent > 0 ? 999 : 0;
    const grad =
      usedPct > 100
        ? "linear-gradient(90deg,#f87171,#c81e1e)"
        : usedPct >= 80
          ? "linear-gradient(90deg,#f59e0b,#b45309)"
          : "var(--grad-verde)";
    const sinPresu = amt <= 0;
    return (
      <li key={r.id} className="flex items-center gap-3 border-b border-dashed border-line py-3 last:border-b-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gold/10 text-gold">
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-ink">{r.name}</span>
            {sinPresu ? (
              <span className="rounded-full border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-[0.04em] text-ink-muted">
                por asignar
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, usedPct)}%`, backgroundImage: grad }} />
          </div>
          <div className="mt-1 text-[11px] text-ink-muted">
            Gastado <b className="tabular text-ink">{formatCurrency(r.spent)}</b>
            {sinPresu ? "" : ` de ${formatCurrency(amt)} · ${Math.round(usedPct)}%`}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={pct}
            onChange={(e) => setPct(r.id, Number(e.target.value) || 0)}
            className="tabular w-14 rounded-[8px] border border-line bg-card px-2 py-1.5 text-right text-sm font-medium text-ink outline-none focus:border-gold"
          />
          <span className="text-xs text-ink-muted">%</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-xs text-ink-muted">S/</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amt}
            onChange={(e) => setAmt(r.id, Number(e.target.value) || 0)}
            className="tabular w-24 rounded-[8px] border border-line bg-card px-2 py-1.5 text-right text-sm text-ink outline-none focus:border-gold"
          />
        </div>
      </li>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="vault-card px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              Presupuesto de {monthLabel}
            </div>
            <div className="mt-1 flex w-fit items-center gap-2 rounded-[10px] border border-line bg-card px-3 py-1.5">
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
                className="font-display tabular w-28 border-0 bg-transparent text-right text-2xl font-bold text-ink outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Gastado</div>
              <div className="font-display tabular mt-0.5 text-lg font-bold text-ink">{formatCurrency(spentTotal)}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Restante</div>
              <div className={`font-display tabular mt-0.5 text-lg font-bold ${restante < 0 ? "text-danger-ink" : "text-gold"}`}>
                {formatCurrency(restante)}
              </div>
            </div>
            {isCurrent ? (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Días restantes</div>
                <div className="font-display tabular mt-0.5 text-lg font-bold text-ink">{daysLeft}</div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-bg">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, overallPct)}%`,
              backgroundImage: overallPct > 100 ? "linear-gradient(90deg,#f87171,#c81e1e)" : "var(--grad-verde)",
            }}
          />
        </div>

        {isCurrent && projected !== null ? (
          <div className="mt-3 flex items-center gap-2 text-[13px]">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${projOver ? "bg-danger/15 text-danger-ink" : "bg-gold/15 text-gold"}`}>
              {projOver ? "Ritmo alto" : "En camino"}
            </span>
            <span className="text-ink-muted">
              A este ritmo terminarías en <b className={projOver ? "text-danger-ink" : "text-ink"}>{formatCurrency(projected)}</b>
              {projOver ? ` — ${formatCurrency(round2(projected - total))} sobre tu techo.` : "."}
            </span>
          </div>
        ) : null}
      </div>

      <div className="vault-card px-5 py-5">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-ink">Por categoría</h2>
          {overridden ? (
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-gold">
              Ajustado este mes
            </span>
          ) : null}
        </div>
        <p className="mb-3 text-xs text-ink-muted">
          Ajusta el % (o el monto) para este mes. El próximo mes vuelve a tu presupuesto por defecto.
        </p>

        {budgetedRows.length > 0 ? (
          <ul className="flex flex-col">{budgetedRows.map(renderRow)}</ul>
        ) : (
          <p className="py-4 text-center text-sm text-ink-muted">
            Aún no asignas presupuesto a ninguna categoría.
          </p>
        )}

        {unbudgetedRows.length > 0 ? (
          <div className={budgetedRows.length > 0 ? "mt-2" : ""}>
            <button
              type="button"
              onClick={() => setShowUnbudgeted((v) => !v)}
              className="flex w-full items-center justify-between rounded-[8px] px-1 py-2.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <span>
                {showUnbudgeted ? "Ocultar" : "Ver"} categorías sin presupuesto
                <span className="ml-1 text-ink-muted">({unbudgetedRows.length})</span>
                {!showUnbudgeted && spentUnbudgeted > 0 ? (
                  <span className="ml-2 text-[11px] text-ink-muted">· gastado {formatCurrency(spentUnbudgeted)}</span>
                ) : null}
              </span>
              <IconChevronDown
                size={16}
                className={`transition-transform ${showUnbudgeted ? "rotate-180" : ""}`}
              />
            </button>
            {showUnbudgeted ? <ul className="flex flex-col">{unbudgetedRows.map(renderRow)}</ul> : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div className="text-[13px]">
            <span className={over ? "font-semibold text-danger-ink" : "text-ink"}>
              Asignado <b className="tabular">{sum}%</b>
            </span>
            <span className="text-ink-muted"> · sin asignar <b className="tabular text-ink">{round2(Math.max(0, 100 - sum))}%</b></span>
            {over ? <span className="ml-2 text-danger-ink">La suma supera el 100%.</span> : null}
          </div>
          <div className="flex items-center gap-2">
            {overridden ? (
              <button type="button" onClick={reset} disabled={isPending} className="inline-flex items-center gap-1.5 rounded-[10px] border border-line px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-50">
                <IconRotate size={15} /> Restablecer
              </button>
            ) : null}
            <button type="button" onClick={save} disabled={over || isPending} className="inline-flex items-center gap-2 rounded-[10px] bg-gold px-4 py-2 text-sm font-semibold text-gold-ink transition-colors hover:bg-gold-hover disabled:opacity-50">
              {isPending ? <><Spinner className="h-4 w-4" /> Guardando…</> : saved ? <><IconCheck size={16} /> Guardado</> : "Guardar mes"}
            </button>
          </div>
        </div>
        {error ? <p className="mt-2 text-xs text-danger-ink" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}
