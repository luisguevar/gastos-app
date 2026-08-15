import { iconByKey } from "@/lib/category-icons";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ExpenseRow } from "@/lib/types";

export function RecentExpenses({ expenses }: { expenses: ExpenseRow[] }) {
  if (expenses.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-muted">Sin gastos recientes.</p>;
  }

  return (
    <ul className="mt-4 flex flex-col">
      {expenses.map((e) => {
        const Icon = iconByKey(e.category_icon);
        return (
          <li
            key={e.id}
            className="flex items-center gap-3 border-b border-dashed border-line py-2.5 last:border-b-0"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gold/10 text-gold">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink">
                {e.description || e.category_name}
              </span>
              <span className="block text-[11px] text-ink-muted">
                {e.category_name} · {e.payment_type_name} · {formatDate(e.expense_date)}
              </span>
            </span>
            <span className="tabular shrink-0 text-[13px] font-semibold text-ink">
              {formatCurrency(e.amount)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
