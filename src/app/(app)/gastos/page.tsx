import { createClient } from "@/lib/supabase/server";
import { getCategories, getPaymentAccounts, getPaymentTypes, getTags, getExpenses } from "@/lib/queries";
import { buildColorMap } from "@/lib/palette";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import type { Category, PaymentAccount, PaymentType, Tag } from "@/lib/types";

export const dynamic = "force-dynamic";

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

export default async function GastosPage() {
  const supabase = await createClient();

  const [allCategories, activeCategories, activePaymentTypes, activePaymentAccounts, activeTags, expenses] =
    await Promise.all([
      getCategories(supabase),
      getCategories(supabase, { activeOnly: true }),
      getPaymentTypes(supabase, { activeOnly: true }),
      getPaymentAccounts(supabase, { activeOnly: true }),
      getTags(supabase, { activeOnly: true }),
      getExpenses(supabase, { limit: 20 }),
    ]);

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
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Bóveda</p>
        <h1 className="font-display text-xl font-semibold text-ink">Gastos</h1>
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
        <ExpenseList
          expenses={expenses}
          categories={categoriesForForm}
          paymentTypes={paymentTypesForForm}
          paymentAccounts={paymentAccountsForForm}
          tags={tagsForForm}
          categoryColorMap={categoryColorMap}
        />
      </section>
    </>
  );
}
