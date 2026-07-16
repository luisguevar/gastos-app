import { formatCurrency } from "@/lib/format";

export function StatTile({
  label,
  amount,
  hint,
  highlight = false,
}: {
  label: string;
  amount: number;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div className="vault-card flex flex-col gap-1 px-4 py-3">
      <span className="text-[11px] uppercase tracking-[0.15em] text-ink-muted">
        {label}
      </span>
      <span
        className={`font-display tabular text-xl font-semibold leading-tight ${
          highlight ? "text-gold" : "text-ink"
        }`}
      >
        {formatCurrency(amount)}
      </span>
      {hint ? (
        <span className="text-[11px] text-ink-muted">{hint}</span>
      ) : null}
    </div>
  );
}
