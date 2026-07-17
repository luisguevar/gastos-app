"use client";

import { useState } from "react";
import { ExpenseForm } from "@/components/expense-form";
import { Modal } from "@/components/modal";
import { DeleteExpenseModal } from "@/components/delete-expense-modal";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Category, ExpenseRow, PaymentAccount, PaymentType, Tag } from "@/lib/types";

export function ExpenseList({
  expenses,
  categories,
  paymentTypes,
  paymentAccounts,
  tags,
  categoryColorMap,
}: {
  expenses: ExpenseRow[];
  categories: Category[];
  paymentTypes: PaymentType[];
  paymentAccounts: PaymentAccount[];
  tags: Tag[];
  categoryColorMap: Map<string, string>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editingExpense = expenses.find((e) => e.id === editingId) ?? null;
  const deletingExpense = expenses.find((e) => e.id === deletingId) ?? null;

  if (expenses.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-muted">
        Aún no registras gastos.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="flex items-baseline gap-3 border-b border-dashed border-line py-2.5 last:border-b-0"
          >
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: categoryColorMap.get(expense.category_id) }}
            />
            <button
              type="button"
              onClick={() => setEditingId(expense.id)}
              className="flex min-w-0 flex-1 flex-col text-left"
            >
              <span className="truncate text-sm text-ink">
                {expense.description || expense.category_name}
              </span>
              <span className="text-[11px] text-ink-muted">
                {expense.category_name} · {expense.payment_type_name}
                {expense.payment_account_name ? ` · ${expense.payment_account_name}` : ""} ·{" "}
                {formatDate(expense.expense_date)}
              </span>
              {expense.tags.length > 0 ? (
                <span className="mt-1 flex flex-wrap gap-1">
                  {expense.tags.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-full border border-line px-2 py-0.5 text-[10px] text-ink-muted"
                    >
                      {t.name}
                    </span>
                  ))}
                </span>
              ) : null}
            </button>
            <span className="font-display tabular shrink-0 text-sm font-medium text-ink">
              {formatCurrency(expense.amount)}
            </span>
            <button
              type="button"
              onClick={() => setDeletingId(expense.id)}
              aria-label={`Borrar gasto de ${formatCurrency(expense.amount)}`}
              className="shrink-0 px-1.5 text-ink-muted opacity-60 transition-opacity hover:text-danger-ink hover:opacity-100"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={editingExpense !== null}
        onClose={() => setEditingId(null)}
        title="Editar gasto"
      >
        {editingExpense ? (
          <ExpenseForm
            mode="edit"
            expenseId={editingExpense.id}
            categories={categories}
            paymentTypes={paymentTypes}
            paymentAccounts={paymentAccounts}
            tags={tags}
            defaults={{
              amount: editingExpense.amount,
              categoryId: editingExpense.category_id,
              paymentTypeId: editingExpense.payment_type_id,
              paymentAccountId: editingExpense.payment_account_id,
              description: editingExpense.description ?? "",
              expenseDate: editingExpense.expense_date,
              tagIds: editingExpense.tags.map((t) => t.id),
            }}
            onSuccess={() => setEditingId(null)}
          />
        ) : null}
      </Modal>

      <DeleteExpenseModal expense={deletingExpense} onClose={() => setDeletingId(null)} />
    </>
  );
}
