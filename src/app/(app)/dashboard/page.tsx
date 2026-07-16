import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getExpenses, getPaymentTypes, getTags } from "@/lib/queries";
import { buildColorMap } from "@/lib/palette";
import {
  daysAgoInLima,
  daysBetweenInclusive,
  lastNDays,
  startOfMonthInLima,
  todayInLima,
} from "@/lib/date";
import { StatTile } from "@/components/stat-tile";
import { DashboardFilters } from "@/components/dashboard-filters";
import { CategoryPieChart, type CategoryTotal } from "@/components/charts/category-pie-chart";
import { TrendChart, type TrendPoint } from "@/components/charts/trend-chart";
import { PaymentTypeChart, type PaymentTypeTotal } from "@/components/charts/payment-type-chart";
import { CashDigitalMeter } from "@/components/cash-digital-meter";
import { TopTagsList, type TopTag } from "@/components/top-tags-list";

export const dynamic = "force-dynamic";

type SearchParams = {
  from?: string;
  to?: string;
  categoryId?: string;
  tagId?: string;
  paymentTypeId?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const from = params.from || startOfMonthInLima();
  const to = params.to || todayInLima();
  const today = todayInLima();

  const nonDateFilters = {
    categoryId: params.categoryId || undefined,
    tagId: params.tagId || undefined,
    paymentTypeId: params.paymentTypeId || undefined,
  };

  const [allCategories, allTags, allPaymentTypes, periodExpenses, todayExpenses, trendExpenses] =
    await Promise.all([
      getCategories(supabase),
      getTags(supabase, { activeOnly: true }),
      getPaymentTypes(supabase, { activeOnly: true }),
      getExpenses(supabase, { dateFrom: from, dateTo: to, ...nonDateFilters }),
      getExpenses(supabase, { dateFrom: today, dateTo: today, ...nonDateFilters }),
      getExpenses(supabase, { dateFrom: daysAgoInLima(29), dateTo: today, ...nonDateFilters }),
    ]);

  const categoryColorMap = buildColorMap(allCategories);

  const periodTotal = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgDaily = periodTotal / daysBetweenInclusive(from, to);

  const categoryMap = new Map<string, CategoryTotal>();
  for (const e of periodExpenses) {
    const existing = categoryMap.get(e.category_id);
    if (existing) existing.total += e.amount;
    else
      categoryMap.set(e.category_id, {
        categoryId: e.category_id,
        categoryName: e.category_name,
        total: e.amount,
        color: categoryColorMap.get(e.category_id) ?? "var(--cat-8)",
      });
  }

  const paymentTypeMap = new Map<string, PaymentTypeTotal>();
  for (const e of periodExpenses) {
    const existing = paymentTypeMap.get(e.payment_type_id);
    if (existing) existing.total += e.amount;
    else paymentTypeMap.set(e.payment_type_id, { id: e.payment_type_id, name: e.payment_type_name, total: e.amount });
  }

  let cash = 0;
  let digital = 0;
  for (const e of periodExpenses) {
    if (e.payment_type_name.trim().toLowerCase() === "efectivo") cash += e.amount;
    else digital += e.amount;
  }

  const tagTotalsMap = new Map<string, TopTag>();
  for (const e of periodExpenses) {
    for (const t of e.tags) {
      const existing = tagTotalsMap.get(t.id);
      if (existing) existing.total += e.amount;
      else tagTotalsMap.set(t.id, { id: t.id, name: t.name, total: e.amount });
    }
  }
  const topTags = Array.from(tagTotalsMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const trendMap = new Map<string, number>();
  for (const e of trendExpenses) {
    trendMap.set(e.expense_date, (trendMap.get(e.expense_date) ?? 0) + e.amount);
  }
  const trendData: TrendPoint[] = lastNDays(30).map((date) => ({
    date,
    total: trendMap.get(date) ?? 0,
  }));

  return (
    <>
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Bóveda</p>
        <h1 className="font-display text-xl font-semibold text-ink">Dashboard</h1>
      </header>

      <Suspense fallback={<div className="vault-card h-24 px-6 py-5" />}>
        <DashboardFilters
          categories={allCategories.filter((c) => c.activa)}
          tags={allTags}
          paymentTypes={allPaymentTypes}
          defaultFrom={from}
          defaultTo={to}
        />
      </Suspense>

      <section className="grid grid-cols-3 gap-3">
        <StatTile label="Hoy" amount={todayTotal} />
        <StatTile label="Total del período" amount={periodTotal} highlight />
        <StatTile
          label="Promedio diario"
          amount={avgDaily}
          hint={`${daysBetweenInclusive(from, to)} día(s) en el rango`}
        />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Por categoría
        </h2>
        <CategoryPieChart data={Array.from(categoryMap.values())} />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Tendencia · últimos 30 días
        </h2>
        <TrendChart data={trendData} />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Por tipo de pago
        </h2>
        <PaymentTypeChart data={Array.from(paymentTypeMap.values())} />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Efectivo vs. digital
        </h2>
        <CashDigitalMeter cash={cash} digital={digital} />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Top etiquetas
        </h2>
        <TopTagsList tags={topTags} />
      </section>
    </>
  );
}
