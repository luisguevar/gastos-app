"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addLoan, updateLoan, type LoanFormState } from "@/app/actions/loans";
import { TagMultiSelect } from "@/components/tag-multiselect";
import { PaymentMethodPicker } from "@/components/payment-method-picker";
import { PersonPicker } from "@/components/person-picker";
import { todayInLima } from "@/lib/date";
import { Spinner } from "@/components/loader";
import type { Category, PaymentAccount, PaymentType, Person, Tag } from "@/lib/types";

const initialState: LoanFormState = {};

const fieldClass =
  "rounded-[8px] border border-line bg-card px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-gold";

function isAmountInvalid(value: string): boolean {
  const num = Number(value.replace(",", "."));
  return value.trim() === "" || !Number.isFinite(num) || num <= 0;
}

function SubmitButton({
  label,
  pendingLabel,
  disabled,
}: {
  label: string;
  pendingLabel: string;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-[10px] bg-gold py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-gold-ink transition-colors hover:bg-gold-hover disabled:opacity-50"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner className="h-4 w-4" /> {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

export type LoanFormDefaults = {
  amount: number;
  categoryId: string;
  paymentTypeId: string;
  paymentAccountId: string | null;
  description: string;
  expenseDate: string;
  tagIds: string[];
  personId: string | null;
  paid: boolean;
};

export function LoanForm({
  mode,
  loanId,
  categories,
  paymentTypes,
  paymentAccounts,
  tags,
  people,
  defaults,
  onSuccess,
}: {
  mode: "create" | "edit";
  loanId?: string;
  categories: Category[];
  paymentTypes: PaymentType[];
  paymentAccounts: PaymentAccount[];
  tags: Tag[];
  people: Person[];
  defaults?: LoanFormDefaults;
  onSuccess?: () => void;
}) {
  const action =
    mode === "edit" && loanId ? updateLoan.bind(null, loanId) : addLoan;
  const [state, formAction] = useFormState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  const [amount, setAmount] = useState(
    defaults?.amount !== undefined ? String(defaults.amount) : ""
  );
  const [amountTouched, setAmountTouched] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const amountInvalid = isAmountInvalid(amount);
  const amountErrorMessage =
    amountTouched && amountInvalid ? "El monto debe ser mayor a cero." : null;

  useEffect(() => {
    if (submittedRef.current && !state.error) {
      submittedRef.current = false;
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setAmountTouched(true);
        if (isAmountInvalid(amount)) {
          setClientError("El monto debe ser mayor a cero.");
          return;
        }
        const expenseDate = String(formData.get("expense_date") ?? "");
        if (expenseDate > todayInLima()) {
          setClientError("La fecha no puede ser una fecha futura.");
          return;
        }
        setClientError(null);
        submittedRef.current = true;
        formAction(formData);
        if (mode === "create") {
          formRef.current?.reset();
          setAmount("");
          setAmountTouched(false);
        }
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setAmountTouched(true)}
            placeholder="0.00"
            className={`${fieldClass} tabular`}
          />
          {amountErrorMessage ? (
            <span className="text-xs text-danger-ink" role="alert">
              {amountErrorMessage}
            </span>
          ) : null}
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

      <PersonPicker allPeople={people} defaultSelectedId={defaults?.personId ?? null} />

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
          placeholder="Ej. Adelanto, emergencia…"
          className={fieldClass}
        />
      </label>

      <TagMultiSelect allTags={tags} defaultSelectedIds={defaults?.tagIds ?? []} />

      <label className="flex items-center gap-2.5 rounded-[8px] border border-line bg-card px-3 py-2.5">
        <input
          name="loan_paid"
          type="checkbox"
          defaultChecked={defaults?.paid ?? false}
          className="h-4 w-4 accent-[color:var(--gold)]"
        />
        <span className="text-sm text-ink">Ya me lo pagó</span>
      </label>

      {clientError ?? state.error ? (
        <p className="text-sm text-danger-ink" role="alert">
          {clientError ?? state.error}
        </p>
      ) : null}

      <SubmitButton
        label={mode === "edit" ? "Guardar cambios" : "Registrar préstamo"}
        pendingLabel="Guardando…"
        disabled={amountInvalid}
      />
    </form>
  );
}
