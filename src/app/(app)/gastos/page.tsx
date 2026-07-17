import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getPaymentAccounts, getPaymentTypes, getTags, getExpensesPage } from "@/lib/queries";
import { buildColorMap } from "@/lib/palette";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { ExpenseSearch } from "@/components/expense-search";
import { ExpensePagination } from "@/components/expense-pagination";
import { ExportCsvButton } from "@/components/export-csv-button";
import type { Category, PaymentAccount, PaymentType, Tag } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function mergeActiveWithUsed<T extends { id: string; name: string }>(
  active: T[],
  used: { id: string; name: string }[]
): T[] {
  const ids = new Set(active.map((a) => a.id));
  const merged = [...active];
  for (const u of used) {
    if (u.id && !ids.has(u.id)) {
      merged.push({ ...u, activa: false } as unknown as T);
      ids.add(u.id);
    }
  }
  return merged;
}

export default async function GastosPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = await createClient();
  const search = searchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [allCategories, activeCategories, activePaymentTypes, activePaymentAccounts, activeTags, expensesPage] =
    await Promise.all([
      getCategories(supabase),
      getCategories(supabase, { activeOnly: true }),
      getPaymentTypes(supabase, { activeOnly: true }),
      getPaymentAccounts(supabase, { activeOnly: true }),
      getTags(supabase, { activeOnly: true }),
      getExpensesPage(supabase, { search, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    ]);

  const { expenses, total } = expensesPage;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const categoryColorMap = buildColorMap(allCategories);

  const usedCategories = expenses.map((e) => ({ id: e.category_id, name: e.category_name }));
  const usedPaymentTypes = expenses.map((e) => ({ id: e.payment_type_id, name: e.payment_type_name }));
  const usedPaymentAccounts = expenses
    .filter((e) => e.payment_account_id)
    .map((e) => ({ id: e.payment_account_id as string, name: e.payment_account_name as string }));

  const usedTags = expenses.flatMap((e) => e.tags);

  const categoriesForForm = mergeActiveWithUsed<Category>(activeCategories, usedCategories);
  const paymentTypesForForm = mergeActiveWithUsed<PaymentType>(activePaymentTypes, usedPaymentTypes);
  const paymentAccountsForForm = mergeActiveWithUsed<PaymentAccount>(activePaymentAccounts, usedPaymentAccounts);
  const tagsForForm = mergeActiveWithUsed<Tag>(activeTags, usedTags);

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Bóveda</p>
          <h1 className="font-display text-xl font-semibold text-ink">Gastos</h1>
        </div>
        <ExportCsvButton search={search} />
      </header>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Nuevo gasto
        </h2>
        <ExpenseForm
          mode="create"
          categories={categoriesForForm}
          paymentTypes={paymentTypesForForm}
          paymentAccounts={paymentAccountsForForm}
          tags={tagsForForm}
        />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Gastos recientes
        </h2>
        <div className="mb-4">
          <Suspense fallback={<div className="h-[42px] rounded-[8px] border border-line bg-card" />}>
            <ExpenseSearch initialValue={search} />
          </Suspense>
        </div>
        <ExpenseList
          expenses={expenses}
          categories={categoriesForForm}
          paymentTypes={paymentTypesForForm}
          paymentAccounts={paymentAccountsForForm}
          tags={tagsForForm}
          categoryColorMap={categoryColorMap}
        />
        <ExpensePagination page={page} totalPages={totalPages} search={search} />
      </section>
    </>
  );
}
