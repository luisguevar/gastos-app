import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, PaymentAccount, PaymentType, Tag, ExpenseRow } from "@/lib/types";

type Options = { activeOnly?: boolean };

async function getCatalog(
  supabase: SupabaseClient,
  table: "categories" | "tags" | "payment_types" | "payment_accounts",
  { activeOnly = false }: Options = {}
) {
  let query = supabase
    .from(table)
    .select("id,name,activa")
    .order("created_at", { ascending: true });
  if (activeOnly) query = query.eq("activa", true);
  const { data } = await query;
  return (data ?? []) as Category[];
}

export function getCategories(supabase: SupabaseClient, opts?: Options) {
  return getCatalog(supabase, "categories", opts) as Promise<Category[]>;
}

export function getTags(supabase: SupabaseClient, opts?: Options) {
  return getCatalog(supabase, "tags", opts) as Promise<Tag[]>;
}

export function getPaymentTypes(supabase: SupabaseClient, opts?: Options) {
  return getCatalog(supabase, "payment_types", opts) as Promise<PaymentType[]>;
}

export async function getPaymentAccounts(
  supabase: SupabaseClient,
  { activeOnly = false }: Options = {}
): Promise<PaymentAccount[]> {
  let query = supabase
    .from("payment_accounts")
    .select("id,name,activa,payment_type_id")
    .order("created_at", { ascending: true });
  if (activeOnly) query = query.eq("activa", true);
  const { data } = await query;
  return (data ?? []) as PaymentAccount[];
}

const EXPENSE_SELECT = `
  id,
  amount,
  description,
  expense_date,
  category:categories(id,name),
  payment_type:payment_types(id,name),
  payment_account:payment_accounts(id,name),
  expense_tags(tags(id,name))
`;

type RawExpenseRow = {
  id: string;
  amount: number;
  description: string | null;
  expense_date: string;
  category: { id: string; name: string } | null;
  payment_type: { id: string; name: string } | null;
  payment_account: { id: string; name: string } | null;
  expense_tags: { tags: { id: string; name: string } | null }[] | null;
};

function mapExpenseRow(raw: RawExpenseRow): ExpenseRow {
  return {
    id: raw.id,
    amount: Number(raw.amount),
    description: raw.description,
    expense_date: raw.expense_date,
    category_id: raw.category?.id ?? "",
    category_name: raw.category?.name ?? "Sin categoría",
    payment_type_id: raw.payment_type?.id ?? "",
    payment_type_name: raw.payment_type?.name ?? "Sin tipo",
    payment_account_id: raw.payment_account?.id ?? null,
    payment_account_name: raw.payment_account?.name ?? null,
    tags: (raw.expense_tags ?? [])
      .map((et) => et.tags)
      .filter((t): t is { id: string; name: string } => t !== null),
  };
}

export type ExpenseFilters = {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  paymentTypeId?: string;
  tagId?: string;
  limit?: number;
};

export async function getExpenses(
  supabase: SupabaseClient,
  filters: ExpenseFilters = {}
): Promise<ExpenseRow[]> {
  let expenseIdFilter: string[] | null = null;
  if (filters.tagId) {
    const { data } = await supabase
      .from("expense_tags")
      .select("expense_id")
      .eq("tag_id", filters.tagId);
    expenseIdFilter = (data ?? []).map((r) => r.expense_id as string);
    if (expenseIdFilter.length === 0) return [];
  }

  let query = supabase
    .from("expenses")
    .select(EXPENSE_SELECT)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.dateFrom) query = query.gte("expense_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("expense_date", filters.dateTo);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.paymentTypeId) query = query.eq("payment_type_id", filters.paymentTypeId);
  if (expenseIdFilter) query = query.in("id", expenseIdFilter);
  if (filters.limit) query = query.limit(filters.limit);

  const { data } = await query;
  return ((data ?? []) as unknown as RawExpenseRow[]).map(mapExpenseRow);
}
