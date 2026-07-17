"use client";

import { useTransition } from "react";
import { IconTrash } from "@tabler/icons-react";
import { deleteExpense } from "@/app/actions/expenses";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ExpenseRow } from "@/lib/types";

export function DeleteExpenseModal({
  expense,
  onClose,
}: {
  expense: ExpenseRow | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  if (!expense) return null;

  function handleConfirm() {
    startTransition(async () => {
      await deleteExpense(expense!.id);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-xl border border-line bg-card p-5"
        style={{ maxWidth: "320px" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Eliminar este gasto"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(179,58,58,0.15)" }}
        >
          <IconTrash size={20} style={{ color: "#D0645C" }} />
        </div>

        <h2 className="mt-3 text-[15px] font-medium text-ink">Eliminar este gasto</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Esta acción no se puede deshacer. Se eliminará permanentemente:
        </p>

        <div className="mt-3 rounded-[8px] border border-line bg-bg px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-ink">
              {expense.description || expense.category_name}
            </span>
            <span className="font-display tabular shrink-0 text-sm font-medium text-ink">
              {formatCurrency(expense.amount)}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            {expense.category_name} · {formatDate(expense.expense_date)}
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-[8px] border border-line bg-transparent py-2 text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 rounded-[8px] py-2 text-sm text-ink disabled:opacity-60"
            style={{ backgroundColor: "#B33A3A" }}
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
