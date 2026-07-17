"use server";

import { createClient } from "@/lib/supabase/server";
import { getExpenses } from "@/lib/queries";
import type { ExpenseRow } from "@/lib/types";

export async function getExpensesForExport(search: string): Promise<ExpenseRow[]> {
  const supabase = await createClient();
  return getExpenses(supabase, { search: search || undefined });
}
