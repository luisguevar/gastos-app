import { deleteExpense } from "@/app/actions";
import { CATEGORY_VAR } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/format";

export type ExpenseRow = {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
};

export function ExpenseList({ expenses }: { expenses: ExpenseRow[] }) {
  if (expenses.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-muted">
        Aún no registras gastos.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="group flex items-baseline gap-3 border-b border-dashed border-line py-2.5 last:border-b-0"
        >
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: CATEGORY_VAR[expense.category as keyof typeof CATEGORY_VAR] }}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm text-ink">
              {expense.description || expense.category}
            </span>
            <span className="text-[11px] text-ink-muted">
              {expense.category} · {formatDate(expense.expense_date)}
            </span>
          </div>
          <span className="font-display tabular shrink-0 text-sm font-medium text-ink">
            {formatCurrency(expense.amount)}
          </span>
          <form action={deleteExpense.bind(null, expense.id)}>
            <button
              type="submit"
              aria-label={`Borrar gasto de ${formatCurrency(expense.amount)}`}
              className="shrink-0 px-1.5 text-ink-muted opacity-60 transition-opacity hover:text-danger-ink hover:opacity-100"
            >
              ×
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
