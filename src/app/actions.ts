"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/categories";

export type AddExpenseState = {
  error?: string;
};

export async function addExpense(
  _prevState: AddExpenseState,
  formData: FormData
): Promise<AddExpenseState> {
  const amountRaw = String(formData.get("amount") ?? "").replace(",", ".");
  const amount = Number(amountRaw);
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const expenseDate = String(formData.get("expense_date") ?? "");

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Ingresa un monto válido mayor a 0." };
  }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: "Selecciona una categoría válida." };
  }
  if (!expenseDate) {
    return { error: "Selecciona una fecha." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    amount,
    category,
    description: description || null,
    expense_date: expenseDate,
  });

  if (error) {
    return { error: "No se pudo guardar el gasto. Intenta de nuevo." };
  }

  revalidatePath("/");
  return {};
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  await supabase.from("expenses").delete().eq("id", id);
  revalidatePath("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
