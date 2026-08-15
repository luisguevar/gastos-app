import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getMonthBudget, getCategorySpend } from "@/lib/queries";
import { monthStart, monthEnd, dayOfMonthInLima } from "@/lib/date";
import { BudgetMonth, type BudgetCatRow } from "@/components/presupuestos/budget-month";

export const dynamic = "force-dynamic";

const MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const round2 = (n: number) => Math.round(n * 100) / 100;

export default async function PresupuestosPage({
  searchParams,
}: {
  searchParams: { off?: string };
}) {
  const supabase = await createClient();

  const off = Math.trunc(Number(searchParams.off) || 0);
  const month = monthStart(off);
  const from = month;
  const to = monthEnd(off);
  const isCurrent = off === 0;

  const [activeCategories, budget, spend] = await Promise.all([
    getCategories(supabase, { activeOnly: true }),
    getMonthBudget(supabase, month),
    getCategorySpend(supabase, from, to),
  ]);

  const rows: BudgetCatRow[] = activeCategories
    .map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      percent: budget.percents.get(c.id) ?? 0,
      spent: spend.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.percent - a.percent || b.spent - a.spent);

  let spentTotal = 0;
  spend.forEach((v) => (spentTotal += v));
  spentTotal = round2(spentTotal);

  const daysInMonth = Number(to.slice(8, 10));
  const elapsed = isCurrent ? dayOfMonthInLima() : daysInMonth;
  const projected =
    isCurrent && elapsed > 0 && spentTotal > 0 ? round2((spentTotal / elapsed) * daysInMonth) : null;
  const daysLeft = isCurrent ? daysInMonth - dayOfMonthInLima() : 0;

  const monthIdx = Number(month.slice(5, 7)) - 1;
  const monthLabel = `${MES[monthIdx]} ${month.slice(0, 4)}`;
  const hrefOff = (o: number) => (o === 0 ? "/presupuestos" : `/presupuestos?off=${o}`);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Bóveda</p>
          <h1 className="font-display text-xl font-semibold text-ink">Presupuestos</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={hrefOff(off - 1)}
            aria-label="Mes anterior"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-line text-ink-muted transition-colors hover:text-ink"
          >
            <IconChevronLeft size={16} />
          </Link>
          <span className="min-w-[130px] text-center text-sm font-medium text-ink">{monthLabel}</span>
          <Link
            href={hrefOff(off + 1)}
            aria-label="Mes siguiente"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-line text-ink-muted transition-colors hover:text-ink"
          >
            <IconChevronRight size={16} />
          </Link>
        </div>
      </header>

      <BudgetMonth
        key={`${month}-${budget.overridden}`}
        month={month}
        monthLabel={monthLabel}
        rows={rows}
        total={budget.total}
        spentTotal={spentTotal}
        overridden={budget.overridden}
        isCurrent={isCurrent}
        daysLeft={daysLeft}
        projected={projected}
      />
    </>
  );
}
