"use client";

import { useState, useTransition } from "react";
import { IconCheck, IconRotateClockwise } from "@tabler/icons-react";
import { Modal } from "@/components/modal";
import { Spinner } from "@/components/loader";
import { ExpenseForm } from "@/components/expense-form";
import { LoanForm } from "@/components/loan-form";
import { deleteExpense } from "@/app/actions/expenses";
import { deleteLoan, setLoanPaid } from "@/app/actions/loans";
import { iconByKey } from "@/lib/category-icons";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Category, ExpenseRow, PaymentAccount, PaymentType, Person, Tag } from "@/lib/types";

export function ConsumosTable({
  rows,
  categories,
  paymentTypes,
  paymentAccounts,
  tags,
  people,
  showLoanCols,
  emptyLabel = "No hay consumos con este filtro.",
}: {
  rows: ExpenseRow[];
  categories: Category[];
  paymentTypes: PaymentType[];
  paymentAccounts: PaymentAccount[];
  tags: Tag[];
  people: Person[];
  showLoanCols: boolean;
  emptyLabel?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = rows.find((r) => r.id === editingId) ?? null;
  const deleting = rows.find((r) => r.id === deletingId) ?? null;

  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-muted">{emptyLabel}</p>;
  }

  function togglePaid(row: ExpenseRow) {
    setPendingId(row.id);
    startTransition(async () => {
      await setLoanPaid(row.id, !row.loan_paid);
      setPendingId(null);
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const { id, is_loan } = deleting;
    startTransition(async () => {
      if (is_loan) await deleteLoan(id);
      else await deleteExpense(id);
      setDeletingId(null);
    });
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.05em] text-ink-muted">
              <th className="py-2.5 pr-3 font-semibold">Concepto</th>
              <th className="px-3 py-2.5 font-semibold">Tipo</th>
              {showLoanCols ? <th className="px-3 py-2.5 font-semibold">Persona</th> : null}
              <th className="px-3 py-2.5 font-semibold">Fuente</th>
              <th className="px-3 py-2.5 font-semibold">Fecha</th>
              <th className="px-3 py-2.5 text-right font-semibold">Monto</th>
              {showLoanCols ? <th className="px-3 py-2.5 font-semibold">Estado</th> : null}
              <th className="py-2.5 pl-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const Icon = iconByKey(row.category_icon);
              return (
                <tr key={row.id} className="border-b border-line text-sm last:border-b-0 hover:bg-bg/50">
                  <td className="py-3 pr-3">
                    <button
                      type="button"
                      onClick={() => setEditingId(row.id)}
                      className="flex items-center gap-3 text-left"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gold/10 text-gold">
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">
                          {row.description || row.category_name}
                        </span>
                        <span className="block text-[11px] text-ink-muted">
                          {row.category_name}
                          {row.tags.length > 0 ? ` · ${row.tags.map((t) => t.name).join(", ")}` : ""}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.03em]"
                      style={
                        row.is_loan
                          ? { background: "rgba(124,58,237,0.14)", color: "#7c3aed" }
                          : { background: "var(--bg)", color: "var(--text-muted)" }
                      }
                    >
                      {row.is_loan ? "Préstamo" : "Gasto"}
                    </span>
                  </td>
                  {showLoanCols ? (
                    <td className="px-3 py-3 text-ink">
                      {row.is_loan ? row.loan_person_name ?? "—" : <span className="text-ink-muted">—</span>}
                    </td>
                  ) : null}
                  <td className="px-3 py-3 text-ink-muted">
                    {row.payment_type_name}
                    {row.payment_account_name ? ` · ${row.payment_account_name}` : ""}
                  </td>
                  <td className="px-3 py-3 text-ink-muted">{formatDate(row.expense_date)}</td>
                  <td className="tabular px-3 py-3 text-right font-semibold text-ink">
                    {formatCurrency(row.amount)}
                  </td>
                  {showLoanCols ? (
                    <td className="px-3 py-3">
                      {row.is_loan ? (
                        <button
                          type="button"
                          onClick={() => togglePaid(row)}
                          disabled={isPending && pendingId === row.id}
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.03em] transition-colors disabled:opacity-40 ${
                            row.loan_paid
                              ? "border-gold text-gold hover:bg-gold/10"
                              : "border-line text-ink-muted hover:border-gold hover:text-ink"
                          }`}
                          title={row.loan_paid ? "Marcar pendiente" : "Marcar pagado"}
                        >
                          {isPending && pendingId === row.id ? (
                            <Spinner className="h-3 w-3" />
                          ) : row.loan_paid ? (
                            <IconRotateClockwise size={11} />
                          ) : (
                            <IconCheck size={11} />
                          )}
                          {row.loan_paid ? "Pagado" : "Pendiente"}
                        </button>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                  ) : null}
                  <td className="py-3 pl-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDeletingId(row.id)}
                      aria-label="Borrar"
                      className="px-1.5 text-ink-muted opacity-60 transition-opacity hover:text-danger-ink hover:opacity-100"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditingId(null)}
        title={editing?.is_loan ? "Editar préstamo" : "Editar gasto"}
      >
        {editing && editing.is_loan ? (
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
        ) : editing ? (
          <ExpenseForm
            mode="edit"
            expenseId={editing.id}
            categories={categories}
            paymentTypes={paymentTypes}
            paymentAccounts={paymentAccounts}
            tags={tags}
            defaults={{
              amount: editing.amount,
              categoryId: editing.category_id,
              paymentTypeId: editing.payment_type_id,
              paymentAccountId: editing.payment_account_id,
              description: editing.description ?? "",
              expenseDate: editing.expense_date,
              tagIds: editing.tags.map((t) => t.id),
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
          >
            <h2 className="text-[15px] font-medium text-ink">
              Eliminar este {deleting.is_loan ? "préstamo" : "gasto"}
            </h2>
            <p className="mt-1 text-[13px] text-ink-muted">Esta acción no se puede deshacer.</p>
            <div className="mt-3 rounded-[8px] border border-line bg-bg px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-ink">
                  {deleting.description || deleting.category_name}
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
                {isPending ? (
                  <span className="inline-flex items-center gap-2"><Spinner className="h-3.5 w-3.5" /> Eliminando…</span>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
