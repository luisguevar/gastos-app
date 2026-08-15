import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, PaymentAccount, PaymentType, Person, Tag, ExpenseRow } from "@/lib/types";

type Options = { activeOnly?: boolean };

async function getCatalog(
  supabase: SupabaseClient,
  table: "categories" | "tags" | "payment_types" | "payment_accounts" | "people",
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

export async function getCategories(
  supabase: SupabaseClient,
  { activeOnly = false }: Options = {}
): Promise<Category[]> {
  let query = supabase
    .from("categories")
    .select("id,name,activa,icon")
    .order("created_at", { ascending: true });
  if (activeOnly) query = query.eq("activa", true);
  const { data } = await query;
  return (data ?? []) as Category[];
}

export function getTags(supabase: SupabaseClient, opts?: Options) {
  return getCatalog(supabase, "tags", opts) as Promise<Tag[]>;
}

export function getPaymentTypes(supabase: SupabaseClient, opts?: Options) {
  return getCatalog(supabase, "payment_types", opts) as Promise<PaymentType[]>;
}

export function getPeople(supabase: SupabaseClient, opts?: Options) {
  return getCatalog(supabase, "people", opts) as Promise<Person[]>;
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
  is_loan,
  loan_paid,
  loan_paid_date,
  category:categories(id,name,icon),
  payment_type:payment_types(id,name),
  payment_account:payment_accounts(id,name),
  loan_person:people(id,name),
  expense_tags(tags(id,name))
`;

type RawExpenseRow = {
  id: string;
  amount: number;
  description: string | null;
  expense_date: string;
  is_loan: boolean;
  loan_paid: boolean;
  loan_paid_date: string | null;
  category: { id: string; name: string; icon: string | null } | null;
  payment_type: { id: string; name: string } | null;
  payment_account: { id: string; name: string } | null;
  loan_person: { id: string; name: string } | null;
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
    category_icon: raw.category?.icon ?? null,
    payment_type_id: raw.payment_type?.id ?? "",
    payment_type_name: raw.payment_type?.name ?? "Sin tipo",
    payment_account_id: raw.payment_account?.id ?? null,
    payment_account_name: raw.payment_account?.name ?? null,
    tags: (raw.expense_tags ?? [])
      .map((et) => et.tags)
      .filter((t): t is { id: string; name: string } => t !== null),
    is_loan: raw.is_loan,
    loan_person_id: raw.loan_person?.id ?? null,
    loan_person_name: raw.loan_person?.name ?? null,
    loan_paid: raw.loan_paid,
    loan_paid_date: raw.loan_paid_date,
  };
}

export type ExpenseFilters = {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  paymentTypeId?: string;
  tagId?: string;
  search?: string;
  limit?: number;
  // Préstamos: isLoan=false -> solo gastos; true -> solo préstamos; undefined -> ambos.
  isLoan?: boolean;
  personId?: string;
  paid?: boolean;
};

async function resolveTagExpenseIds(
  supabase: SupabaseClient,
  tagId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("expense_tags")
    .select("expense_id")
    .eq("tag_id", tagId);
  return (data ?? []).map((r) => r.expense_id as string);
}

function applyCommonFilters<T>(query: T, filters: ExpenseFilters): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = query as any;
  if (filters.dateFrom) q = q.gte("expense_date", filters.dateFrom);
  if (filters.dateTo) q = q.lte("expense_date", filters.dateTo);
  if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
  if (filters.paymentTypeId) q = q.eq("payment_type_id", filters.paymentTypeId);
  if (filters.search) q = q.ilike("description", `%${filters.search}%`);
  if (filters.isLoan !== undefined) q = q.eq("is_loan", filters.isLoan);
  if (filters.personId) q = q.eq("loan_person_id", filters.personId);
  if (filters.paid !== undefined) q = q.eq("loan_paid", filters.paid);
  return q as T;
}

export async function getExpenses(
  supabase: SupabaseClient,
  filters: ExpenseFilters = {}
): Promise<ExpenseRow[]> {
  let expenseIdFilter: string[] | null = null;
  if (filters.tagId) {
    expenseIdFilter = await resolveTagExpenseIds(supabase, filters.tagId);
    if (expenseIdFilter.length === 0) return [];
  }

  let query = supabase
    .from("expenses")
    .select(EXPENSE_SELECT)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  query = applyCommonFilters(query, filters);
  if (expenseIdFilter) query = query.in("id", expenseIdFilter);
  if (filters.limit) query = query.limit(filters.limit);

  const { data } = await query;
  return ((data ?? []) as unknown as RawExpenseRow[]).map(mapExpenseRow);
}

export async function getExpensesPage(
  supabase: SupabaseClient,
  filters: ExpenseFilters & { limit: number; offset: number }
): Promise<{ expenses: ExpenseRow[]; total: number }> {
  let expenseIdFilter: string[] | null = null;
  if (filters.tagId) {
    expenseIdFilter = await resolveTagExpenseIds(supabase, filters.tagId);
    if (expenseIdFilter.length === 0) return { expenses: [], total: 0 };
  }

  let query = supabase
    .from("expenses")
    .select(EXPENSE_SELECT, { count: "exact" })
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  query = applyCommonFilters(query, filters);
  if (expenseIdFilter) query = query.in("id", expenseIdFilter);
  query = query.range(filters.offset, filters.offset + filters.limit - 1);

  const { data, count } = await query;
  const expenses = ((data ?? []) as unknown as RawExpenseRow[]).map(mapExpenseRow);
  return { expenses, total: count ?? expenses.length };
}

// Resumen liviano para los indicadores de Consumos: trae solo las columnas
// necesarias para sumar (no los joins), sobre TODO el conjunto filtrado.
// Así la tabla puede paginar en servidor sin renunciar a los totales.
export type ConsumosSummaryRow = {
  amount: number;
  is_loan: boolean;
  loan_paid: boolean;
  loan_person_id: string | null;
};

export async function getConsumosSummary(
  supabase: SupabaseClient,
  filters: ExpenseFilters = {}
): Promise<ConsumosSummaryRow[]> {
  let query = supabase.from("expenses").select("amount,is_loan,loan_paid,loan_person_id");
  query = applyCommonFilters(query, filters);
  const { data } = await query;
  return (
    (data ?? []) as {
      amount: number;
      is_loan: boolean;
      loan_paid: boolean;
      loan_person_id: string | null;
    }[]
  ).map((r) => ({
    amount: Number(r.amount),
    is_loan: r.is_loan,
    loan_paid: r.loan_paid,
    loan_person_id: r.loan_person_id,
  }));
}
