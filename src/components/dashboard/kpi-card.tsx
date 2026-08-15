import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconMinus,
  type TablerIcon,
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/format";

export function KpiCard({
  label,
  value,
  icon: Icon,
  gradient,
  deltaPct,
  periodLabel,
}: {
  label: string;
  value: number;
  icon: TablerIcon;
  gradient: string;
  deltaPct: number | null;
  periodLabel: string;
}) {
  const up = deltaPct !== null && deltaPct > 0;
  const down = deltaPct !== null && deltaPct < 0;
  // Gastar más (▲) es "malo" (rojo); gastar menos (▼) es "bueno" (verde = gold).
  const Arrow = deltaPct === null ? IconMinus : up ? IconArrowUpRight : down ? IconArrowDownRight : IconMinus;
  const color = up ? "text-danger-ink" : down ? "text-gold" : "text-ink-muted";

  return (
    <div className="rounded-[14px] border border-line bg-card px-4 pb-4 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className="-mt-9 flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] text-white shadow-lg"
          style={{ backgroundImage: gradient }}
        >
          <Icon size={26} />
        </div>
        <div className="flex min-w-0 flex-col items-end text-right">
          <span className="text-[11px] font-medium uppercase leading-tight tracking-[0.04em] text-ink-muted">
            {label}
          </span>
          <span className="font-display tabular mt-1 whitespace-nowrap text-[21px] font-bold leading-none text-ink">
            {formatCurrency(value)}
          </span>
        </div>
      </div>
      <div className="mt-4 border-t border-line pt-2.5 text-xs text-ink-muted">
        <span className={`inline-flex items-center gap-0.5 font-semibold ${color}`}>
          <Arrow size={14} />
          {deltaPct === null ? "—" : `${Math.abs(Math.round(deltaPct))}%`}
        </span>{" "}
        {periodLabel}
      </div>
    </div>
  );
}
