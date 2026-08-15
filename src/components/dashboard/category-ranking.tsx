import { iconByKey } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/format";

export type CatRow = {
  id: string;
  name: string;
  icon: string | null;
  spent: number;
  budget: number;
};

// Semáforo por avance del presupuesto.
function light(usedPct: number) {
  if (usedPct > 100) {
    return { grad: "linear-gradient(90deg,#f87171,#c81e1e)", text: "text-danger-ink" };
  }
  if (usedPct >= 80) {
    return { grad: "linear-gradient(90deg,#f59e0b,#b45309)", text: "text-[#b45309]" };
  }
  return { grad: "var(--grad-verde)", text: "text-gold" };
}

export function CategoryRanking({ rows }: { rows: CatRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-muted">
        Define tu presupuesto en Configuración para ver el avance por categoría.
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col">
      {rows.map((r) => {
        const Icon = iconByKey(r.icon);
        const usedPct = r.budget > 0 ? (r.spent / r.budget) * 100 : 0;
        const s = light(usedPct);
        return (
          <li key={r.id} className="flex items-center gap-3 border-b border-dashed border-line py-3 last:border-b-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gold/10 text-gold">
              <Icon size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm text-ink">{r.name}</span>
                <span className="tabular shrink-0 text-xs text-ink-muted">
                  <b className="text-ink">{formatCurrency(r.spent)}</b> / {formatCurrency(r.budget)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, usedPct)}%`, backgroundImage: s.grad }} />
              </div>
            </div>
            <span className={`tabular w-11 shrink-0 text-right text-sm font-semibold ${s.text}`}>
              {Math.round(usedPct)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
