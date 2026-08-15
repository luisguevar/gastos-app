"use client";

import { useState, useTransition } from "react";
import { IconCheck, IconRotateClockwise } from "@tabler/icons-react";
import { LoanForm } from "@/components/loan-form";
import { Modal } from "@/components/modal";
import { setLoanPaid, deleteLoan } from "@/app/actions/loans";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Category, ExpenseRow, PaymentAccount, PaymentType, Person, Tag } from "@/lib/types";

export function LoanList({
  loans,
  categories,
  paymentTypes,
  paymentAccounts,
  tags,
  people,
  categoryColorMap,
  emptyLabel = "Aún no registras préstamos.",
}: {
  loans: ExpenseRow[];
  categories: Category[];
  paymentTypes: PaymentType[];
  paymentAccounts: PaymentAccount[];
  tags: Tag[];
  people: Person[];
  categoryColorMap: Map<string, string>;
  emptyLabel?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = loans.find((l) => l.id === editingId) ?? null;
  const deleting = loans.find((l) => l.id === deletingId) ?? null;

  if (loans.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-muted">{emptyLabel}</p>;
  }

  function togglePaid(loan: ExpenseRow) {
    setPendingId(loan.id);
    startTransition(async () => {
      await setLoanPaid(loan.id, !loan.loan_paid);
      setPendingId(null);
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const id = deleting.id;
    startTransition(async () => {
      await deleteLoan(id);
      setDeletingId(null);
    });
  }

  return (
    <>
      <ul className="flex flex-col">
        {loans.map((loan) => (
          <li
            key={loan.id}
            className="flex items-start gap-3 border-b border-dashed border-line py-3 last:border-b-0"
          >
            <span
              aria-hidden
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: categoryColorMap.get(loan.category_id) }}
            />
            <button
              type="button"
              onClick={() => setEditingId(loan.id)}
              className="flex min-w-0 flex-1 flex-col text-left"
            >
              <span className="flex items-center gap-2">
                <span className="truncate text-sm text-ink">
                  {loan.loan_person_name ?? "Sin persona"}
                </span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${
                    loan.loan_paid
                      ? "border-gold text-gold"
                      : "border-line text-ink-muted"
                  }`}
                >
                  {loan.loan_paid ? "Pagado" : "Pendiente"}
                </span>
              </span>
              <span className="mt-0.5 text-[11px] text-ink-muted">
                {loan.description ? `${loan.description} · ` : ""}
                {loan.category_name} · {loan.payment_type_name}
                {loan.payment_account_name ? ` · ${loan.payment_account_name}` : ""} ·{" "}
                {formatDate(loan.expense_date)}
              </span>
              {loan.tags.length > 0 ? (
                <span className="mt-1 flex flex-wrap gap-1">
                  {loan.tags.map((t) => (
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

            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="font-display tabular text-sm font-medium text-ink">
                {formatCurrency(loan.amount)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => togglePaid(loan)}
                  disabled={isPending && pendingId === loan.id}
                  aria-label={loan.loan_paid ? "Marcar como pendiente" : "Marcar como pagado"}
                  className="flex items-center gap-1 rounded-[6px] border border-line px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-ink-muted transition-colors hover:border-gold hover:text-ink disabled:opacity-40"
                >
                  {loan.loan_paid ? (
                    <>
                      <IconRotateClockwise size={12} /> Pendiente
                    </>
                  ) : (
                    <>
                      <IconCheck size={12} /> Pagado
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(loan.id)}
                  aria-label={`Borrar préstamo de ${formatCurrency(loan.amount)}`}
                  className="px-1.5 text-ink-muted opacity-60 transition-opacity hover:text-danger-ink hover:opacity-100"
                >
                  ×
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal open={editing !== null} onClose={() => setEditingId(null)} title="Editar préstamo">
        {editing ? (
          <LoanForm
            mode="edit"
            loanId={editing.id}
            categories={categories}
            paymentTypes={paymentTypes}
            paymentAccounts={paymentAccounts}
            tags={tags}
            people={people}
            defaults={{
              amount: editing.amount,
              categoryId: editing.category_id,
              paymentTypeId: editing.payment_type_id,
              paymentAccountId: editing.payment_account_id,
              description: editing.description ?? "",
              expenseDate: editing.expense_date,
              tagIds: editing.tags.map((t) => t.id),
              personId: editing.loan_person_id,
              paid: editing.loan_paid,
            }}
            onSuccess={() => setEditingId(null)}
          />
        ) : null}
      </Modal>

      {deleting ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => setDeletingId(null)}
        >
          <div
            className="w-full rounded-xl border border-line bg-card p-5"
            style={{ maxWidth: "320px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Eliminar este préstamo"
          >
            <h2 className="text-[15px] font-medium text-ink">Eliminar este préstamo</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              Esta acción no se puede deshacer. Se eliminará:
            </p>
            <div className="mt-3 rounded-[8px] border border-line bg-bg px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-ink">
                  {deleting.loan_person_name ?? deleting.category_name}
                </span>
                <span className="font-display tabular shrink-0 text-sm font-medium text-ink">
                  {formatCurrency(deleting.amount)}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-ink-muted">
                {deleting.category_name} · {formatDate(deleting.expense_date)}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isPending}
                className="flex-1 rounded-[8px] border border-line bg-transparent py-2 text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 rounded-[8px] py-2 text-sm text-white disabled:opacity-60"
                style={{ backgroundColor: "#B33A3A" }}
              >
                {isPending ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
