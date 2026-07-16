import { formatCurrency } from "@/lib/format";

export function CashDigitalMeter({ cash, digital }: { cash: number; digital: number }) {
  const total = cash + digital;

  if (total === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-muted">
        No hay gastos en este período.
      </p>
    );
  }

  const cashPct = (cash / total) * 100;
  const digitalPct = 100 - cashPct;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-line/40">
        <div style={{ width: `${cashPct}%` }} className="bg-gold" />
        <div style={{ width: `${digitalPct}%` }} className="bg-ink-muted/50" />
      </div>

      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-2 rounded-full bg-gold" />
          <span className="text-ink">Efectivo</span>
          <span className="tabular text-ink-muted">
            {formatCurrency(cash)} · {cashPct.toFixed(0)}%
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-2 rounded-full bg-ink-muted/60" />
          <span className="text-ink">Digital</span>
          <span className="tabular text-ink-muted">
            {formatCurrency(digital)} · {digitalPct.toFixed(0)}%
          </span>
        </span>
      </div>
    </div>
  );
}
