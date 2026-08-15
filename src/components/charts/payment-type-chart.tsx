import { formatCurrency } from "@/lib/format";

export type PaymentTypeTotal = {
  id: string;
  name: string;
  total: number;
};

export function PaymentTypeChart({ data }: { data: PaymentTypeTotal[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-muted">
        No hay gastos en este período.
      </p>
    );
  }

  const sorted = [...data].sort((a, b) => b.total - a.total);
  const max = Math.max(...sorted.map((d) => d.total));

  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      {sorted.map((item) => {
        const pct = max > 0 ? (item.total / max) * 100 : 0;
        return (
          <div key={item.id}>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-ink-muted">{item.name}</span>
              <span
                className="text-[13px] font-medium text-ink"
                style={{ whiteSpace: "nowrap" }}
              >
                {formatCurrency(item.total)}
              </span>
            </div>
            <div
              className="mt-[6px] w-full overflow-hidden rounded-full bg-bg"
              style={{ height: 8 }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: "var(--neutral)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
