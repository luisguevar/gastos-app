"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addExpense, updateExpense, type ExpenseFormState } from "@/app/actions/expenses";
import { TagMultiSelect } from "@/components/tag-multiselect";
import { PaymentMethodPicker } from "@/components/payment-method-picker";
import { todayInLima } from "@/lib/date";
import type { Category, PaymentAccount, PaymentType, Tag } from "@/lib/types";

const initialState: ExpenseFormState = {};

const fieldClass =
  "rounded-[8px] border border-line bg-card px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-gold";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[10px] bg-gold py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-gold-ink transition-colors hover:bg-gold-hover disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export type ExpenseFormDefaults = {
  amount: number;
  categoryId: string;
  paymentTypeId: string;
  paymentAccountId: string | null;
  description: string;
  expenseDate: string;
  tagIds: string[];
};

export function ExpenseForm({
  mode,
  expenseId,
  categories,
  paymentTypes,
  paymentAccounts,
  tags,
  defaults,
  onSuccess,
}: {
  mode: "create" | "edit";
  expenseId?: string;
  categories: Category[];
  paymentTypes: PaymentType[];
  paymentAccounts: PaymentAccount[];
  tags: Tag[];
  defaults?: ExpenseFormDefaults;
  onSuccess?: () => void;
}) {
  const action =
    mode === "edit" && expenseId ? updateExpense.bind(null, expenseId) : addExpense;
  const [state, formAction] = useFormState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !state.error) {
      submittedRef.current = false;
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const defaultTagIds =
    defaults?.tagIds ?? tags.filter((t) => t.name === "Personal").map((t) => t.id);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        submittedRef.current = true;
        formAction(formData);
        if (mode === "create") formRef.current?.reset();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
            Monto (S/)
          </span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            defaultValue={defaults?.amount}
            placeholder="0.00"
            className={`${fieldClass} tabular`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
            Fecha
          </span>
          <input
            name="expense_date"
            type="date"
            required
            defaultValue={defaults?.expenseDate ?? todayInLima()}
            max={todayInLima()}
            className={`${fieldClass} tabular`}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Categoría
        </span>
        <select
          name="category_id"
          required
          defaultValue={defaults?.categoryId ?? ""}
          className={fieldClass}
        >
          <option value="" disabled>
            Elige una categoría
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <PaymentMethodPicker
        paymentTypes={paymentTypes}
        paymentAccounts={paymentAccounts}
        defaultPaymentTypeId={defaults?.paymentTypeId}
        defaultPaymentAccountId={defaults?.paymentAccountId}
      />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Descripción (opcional)
        </span>
        <input
          name="description"
          type="text"
          maxLength={140}
          defaultValue={defaults?.description ?? ""}
          placeholder="Ej. Almuerzo, pasaje, luz…"
          className={fieldClass}
        />
      </label>

      <TagMultiSelect allTags={tags} defaultSelectedIds={defaultTagIds} />

      {state.error ? (
        <p className="text-sm text-danger-ink" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        label={mode === "edit" ? "Guardar cambios" : "Agregar gasto"}
        pendingLabel={mode === "edit" ? "Guardando…" : "Guardando…"}
      />
    </form>
  );
}
