import { iconByKey } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/format";

export type CatRow = {
  id: string;
  name: string;
  icon: string | null;
  total: number;
  pct: number;
  widthPct: number;
};

export function CategoryRanking({ rows }: { rows: CatRow[] }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-muted">No hay gastos este mes.</p>;
  }

  return (
    <table className="mt-4 w-full border-collapse">
      <thead>
        <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.06em] text-ink-muted">
          <th className="py-2 font-semibold">Categoría</th>
          <th className="py-2 font-semibold">Monto</th>
          <th className="py-2 font-semibold">% del total</th>
          <th className="w-[36%]" />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const Icon = iconByKey(r.icon);
          return (
            <tr key={r.id} className="border-b border-line text-sm last:border-b-0">
              <td className="py-3">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gold/10 text-gold">
                    <Icon size={17} />
                  </span>
                  <span className="text-ink">{r.name}</span>
                </span>
              </td>
              <td className="tabular py-3 font-semibold text-ink">{formatCurrency(r.total)}</td>
              <td className="tabular py-3 text-ink-muted">{r.pct.toFixed(0)}%</td>
              <td className="py-3">
                <div className="h-1.5 min-w-[80px] overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.widthPct}%`, backgroundImage: "var(--grad-verde)" }}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
