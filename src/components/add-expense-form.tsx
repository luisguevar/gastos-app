"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addExpense, type AddExpenseState } from "@/app/actions";
import { CATEGORIES } from "@/lib/categories";
import { todayInLima } from "@/lib/date";

const initialState: AddExpenseState = {};

const fieldClass =
  "rounded-[8px] border border-line bg-card px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-gold";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[10px] bg-gold py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-gold-ink transition-colors hover:bg-gold-hover disabled:opacity-50"
    >
      {pending ? "Guardando…" : "Agregar gasto"}
    </button>
  );
}

export function AddExpenseForm() {
  const [state, formAction] = useFormState(addExpense, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
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
            defaultValue={todayInLima()}
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
          name="category"
          required
          defaultValue=""
          className={fieldClass}
        >
          <option value="" disabled>
            Elige una categoría
          </option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Descripción (opcional)
        </span>
        <input
          name="description"
          type="text"
          maxLength={140}
          placeholder="Ej. Almuerzo, pasaje, luz…"
          className={fieldClass}
        />
      </label>

      {state.error ? (
        <p className="text-sm text-danger-ink" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
