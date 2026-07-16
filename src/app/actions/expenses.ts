"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ExpenseFormState = {
  error?: string;
};

function parseExpenseForm(formData: FormData) {
  const amountRaw = String(formData.get("amount") ?? "").replace(",", ".");
  const amount = Number(amountRaw);
  const categoryId = String(formData.get("category_id") ?? "");
  const paymentTypeId = String(formData.get("payment_type_id") ?? "");
  const paymentAccountId = String(formData.get("payment_account_id") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim();
  const expenseDate = String(formData.get("expense_date") ?? "");
  const tagIds = formData.getAll("tag_ids").map(String).filter(Boolean);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Ingresa un monto válido mayor a 0." } as const;
  }
  if (!categoryId) {
    return { error: "Selecciona una categoría." } as const;
  }
  if (!paymentTypeId) {
    return { error: "Selecciona un tipo de pago." } as const;
  }
  if (!expenseDate) {
    return { error: "Selecciona una fecha." } as const;
  }

  return {
    amount,
    categoryId,
    paymentTypeId,
    paymentAccountId,
    description: description || null,
    expenseDate,
    tagIds,
  } as const;
}

export async function addExpense(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const parsed = parseExpenseForm(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      amount: parsed.amount,
      category_id: parsed.categoryId,
      payment_type_id: parsed.paymentTypeId,
      payment_account_id: parsed.paymentAccountId,
      description: parsed.description,
      expense_date: parsed.expenseDate,
    })
    .select("id")
    .single();

  if (error || !expense) {
    return { error: "No se pudo guardar el gasto. Intenta de nuevo." };
  }

  if (parsed.tagIds.length > 0) {
    await supabase
      .from("expense_tags")
      .insert(parsed.tagIds.map((tagId) => ({ expense_id: expense.id, tag_id: tagId })));
  }

  revalidatePath("/gastos");
  revalidatePath("/dashboard");
  return {};
}

export async function updateExpense(
  id: string,
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const parsed = parseExpenseForm(formData);
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
    })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo actualizar el gasto. Intenta de nuevo." };
  }

  await supabase.from("expense_tags").delete().eq("expense_id", id);
  if (parsed.tagIds.length > 0) {
    await supabase
      .from("expense_tags")
      .insert(parsed.tagIds.map((tagId) => ({ expense_id: id, tag_id: tagId })));
  }

  revalidatePath("/gastos");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  await supabase.from("expenses").delete().eq("id", id);
  revalidatePath("/gastos");
  revalidatePath("/dashboard");
}
