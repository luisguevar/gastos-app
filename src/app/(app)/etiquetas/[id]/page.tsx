import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCategories,
  getExpenses,
  getPaymentAccounts,
  getPaymentTypes,
  getTags,
} from "@/lib/queries";
import { buildColorMap } from "@/lib/palette";
import { formatCurrency } from "@/lib/format";
import { CategoryPieChart, type CategoryTotal } from "@/components/charts/category-pie-chart";
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

export default async function TagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tag } = await supabase
    .from("tags")
    .select("id,name")
    .eq("id", id)
    .maybeSingle();

  if (!tag) notFound();

  const [allCategories, activeCategories, activePaymentTypes, activePaymentAccounts, activeTags, expenses] =
    await Promise.all([
      getCategories(supabase),
      getCategories(supabase, { activeOnly: true }),
      getPaymentTypes(supabase, { activeOnly: true }),
      getPaymentAccounts(supabase, { activeOnly: true }),
      getTags(supabase, { activeOnly: true }),
      getExpenses(supabase, { tagId: id, isLoan: false }),
    ]);

  const categoryColorMap = buildColorMap(allCategories);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryMap = new Map<string, CategoryTotal>();
  for (const e of expenses) {
    const existing = categoryMap.get(e.category_id);
    if (existing) {
      existing.total += e.amount;
    } else {
      categoryMap.set(e.category_id, {
        categoryId: e.category_id,
        categoryName: e.category_name,
        total: e.amount,
        color: categoryColorMap.get(e.category_id) ?? "var(--cat-8)",
      });
    }
  }

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
        <Link href="/dashboard" className="text-xs uppercase tracking-[0.2em] text-ink-muted hover:text-gold">
          ← Dashboard
        </Link>
        <h1 className="font-display mt-1 text-xl font-semibold text-ink">{tag.name}</h1>
      </header>

      <section className="vault-card px-6 py-5">
        <span className="text-[11px] uppercase tracking-[0.15em] text-ink-muted">
          Total acumulado
        </span>
        <p className="font-display tabular mt-1 text-2xl font-semibold text-gold">
          {formatCurrency(total)}
        </p>
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Por categoría
        </h2>
        <CategoryPieChart
          data={Array.from(categoryMap.values())}
          emptyLabel="Sin gastos con esta etiqueta todavía."
        />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Gastos con esta etiqueta
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
