"use server";

import { createClient } from "@/lib/supabase/server";
import { getExpenses, type ExpenseFilters } from "@/lib/queries";
import type { ExpenseRow } from "@/lib/types";

export async function getConsumosForExport(
  filters: ExpenseFilters
): Promise<ExpenseRow[]> {
  const supabase = await createClient();
  return getExpenses(supabase, filters);
}

/** Compatibilidad con el botón de export antiguo (gastos). */
export async function getExpensesForExport(search: string): Promise<ExpenseRow[]> {
  const supabase = await createClient();
  return getExpenses(supabase, { search: search || undefined, isLoan: false });
}
