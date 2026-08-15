"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type BudgetActionState = { error?: string };
export type PercentEntry = { categoryId: string; percent: number };

function validate(total: number, percents: PercentEntry[]): string | null {
  if (!Number.isFinite(total) || total < 0) return "El monto total no es válido.";
  let sum = 0;
  for (const p of percents) {
    if (!Number.isFinite(p.percent) || p.percent < 0 || p.percent > 100)
      return "Hay un porcentaje inválido.";
    sum += p.percent;
  }
  if (sum > 100.001) return "La suma de porcentajes no puede superar el 100%.";
  return null;
}

async function writeBudget(
  month: string | null,
  total: number,
  percents: PercentEntry[]
): Promise<BudgetActionState> {
  const err = validate(total, percents);
  if (err) return { error: err };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Total
  const totalsDel = supabase.from("budget_totals").delete().eq("user_id", user.id);
  await (month === null ? totalsDel.is("month", null) : totalsDel.eq("month", month));
  await supabase.from("budget_totals").insert({ user_id: user.id, month, amount: total });

  // Percents (solo > 0; los 0% quedan "por asignar")
  const pctDel = supabase.from("budget_percents").delete().eq("user_id", user.id);
  await (month === null ? pctDel.is("month", null) : pctDel.eq("month", month));
  const rows = percents
    .filter((p) => p.percent > 0)
    .map((p) => ({ user_id: user.id, category_id: p.categoryId, month, percent: p.percent }));
  if (rows.length > 0) {
    const { error } = await supabase.from("budget_percents").insert(rows);
    if (error) return { error: "No se pudo guardar el reparto. Intenta de nuevo." };
  }

  revalidatePath("/configuracion");
  revalidatePath("/presupuestos");
  revalidatePath("/dashboard");
  return {};
}

/** Guarda el presupuesto por defecto (Configuración). */
export async function saveDefaultBudget(total: number, percents: PercentEntry[]) {
  return writeBudget(null, total, percents);
}

/** Guarda/ajusta el presupuesto de un mes específico ("YYYY-MM-01"). */
export async function saveMonthBudget(month: string, total: number, percents: PercentEntry[]) {
  return writeBudget(month, total, percents);
}

/** Quita los overrides de un mes → vuelve a usar el por defecto. */
export async function resetMonthBudget(month: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("budget_totals").delete().eq("user_id", user.id).eq("month", month);
  await supabase.from("budget_percents").delete().eq("user_id", user.id).eq("month", month);
  revalidatePath("/presupuestos");
  revalidatePath("/dashboard");
}
