"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayInLima } from "@/lib/date";

export type LoanFormState = {
  error?: string;
};

function parseLoanForm(formData: FormData) {
  const amountRaw = String(formData.get("amount") ?? "").replace(",", ".");
  const amount = Number(amountRaw);
  const categoryId = String(formData.get("category_id") ?? "");
  const paymentTypeId = String(formData.get("payment_type_id") ?? "");
  const paymentAccountId = String(formData.get("payment_account_id") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim();
  const expenseDate = String(formData.get("expense_date") ?? "");
  const tagIds = formData.getAll("tag_ids").map(String).filter(Boolean);
  const personId = String(formData.get("loan_person_id") ?? "");
  const paid = formData.get("loan_paid") === "on" || formData.get("loan_paid") === "true";

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El monto debe ser mayor a cero." } as const;
  }
  if (!categoryId) {
    return { error: "Selecciona una categoría." } as const;
  }
  if (!paymentTypeId) {
    return { error: "Selecciona una fuente (tipo de pago)." } as const;
  }
  if (!personId) {
    return { error: "Selecciona a quién le prestaste." } as const;
  }
  if (!expenseDate) {
    return { error: "Selecciona una fecha." } as const;
  }
  if (expenseDate > todayInLima()) {
    return { error: "La fecha no puede ser una fecha futura." } as const;
  }

  return {
    amount,
    categoryId,
    paymentTypeId,
    paymentAccountId,
    description: description || null,
    expenseDate,
    tagIds,
    personId,
    paid,
  } as const;
}

export async function addLoan(
  _prevState: LoanFormState,
  formData: FormData
): Promise<LoanFormState> {
  const parsed = parseLoanForm(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: loan, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      amount: parsed.amount,
      category_id: parsed.categoryId,
      payment_type_id: parsed.paymentTypeId,
      payment_account_id: parsed.paymentAccountId,
      description: parsed.description,
      expense_date: parsed.expenseDate,
      is_loan: true,
      loan_person_id: parsed.personId,
      loan_paid: parsed.paid,
      loan_paid_date: parsed.paid ? parsed.expenseDate : null,
    })
    .select("id")
    .single();

  if (error || !loan) {
    return { error: "No se pudo guardar el préstamo. Intenta de nuevo." };
  }

  if (parsed.tagIds.length > 0) {
    await supabase
      .from("expense_tags")
      .insert(parsed.tagIds.map((tagId) => ({ expense_id: loan.id, tag_id: tagId })));
  }

  revalidatePath("/prestamos");
  revalidatePath("/consumos");
  return {};
}

export async function updateLoan(
  id: string,
  _prevState: LoanFormState,
  formData: FormData
): Promise<LoanFormState> {
  const parsed = parseLoanForm(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("expenses")
    .update({
      amount: parsed.amount,
      category_id: parsed.categoryId,
      payment_type_id: parsed.paymentTypeId,
      payment_account_id: parsed.paymentAccountId,
      description: parsed.description,
      expense_date: parsed.expenseDate,
      loan_person_id: parsed.personId,
      loan_paid: parsed.paid,
      loan_paid_date: parsed.paid
        ? parsed.expenseDate
        : null,
    })
    .eq("id", id)
    .eq("is_loan", true);

  if (error) {
    return { error: "No se pudo actualizar el préstamo. Intenta de nuevo." };
  }

  await supabase.from("expense_tags").delete().eq("expense_id", id);
  if (parsed.tagIds.length > 0) {
    await supabase
      .from("expense_tags")
      .insert(parsed.tagIds.map((tagId) => ({ expense_id: id, tag_id: tagId })));
  }

  revalidatePath("/prestamos");
  revalidatePath("/consumos");
  return {};
}

/** Marca un préstamo como pagado (con fecha de hoy) o pendiente. */
export async function setLoanPaid(id: string, paid: boolean) {
  const supabase = await createClient();
  await supabase
    .from("expenses")
    .update({ loan_paid: paid, loan_paid_date: paid ? todayInLima() : null })
    .eq("id", id)
    .eq("is_loan", true);
  revalidatePath("/prestamos");
  revalidatePath("/consumos");
}

export async function deleteLoan(id: string) {
  const supabase = await createClient();
  await supabase.from("expenses").delete().eq("id", id).eq("is_loan", true);
  revalidatePath("/prestamos");
  revalidatePath("/consumos");
}
