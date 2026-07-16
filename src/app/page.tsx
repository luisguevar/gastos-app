import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { AddExpenseForm } from "@/components/add-expense-form";
import { StatTile } from "@/components/stat-tile";
import { ExpenseList, type ExpenseRow } from "@/components/expense-list";
import { CategoryPieChart, type CategoryTotal } from "@/components/charts/category-pie-chart";
import { TrendChart, type TrendPoint } from "@/components/charts/trend-chart";
import type { Category } from "@/lib/categories";
import {
  daysAgoInLima,
  dayOfMonthInLima,
  lastNDays,
  startOfMonthInLima,
  todayInLima,
} from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = todayInLima();
  const monthStart = startOfMonthInLima();
  const trendStart = daysAgoInLima(29);

  const [monthRes, trendRes, recentRes] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount, category, expense_date")
      .gte("expense_date", monthStart)
      .lte("expense_date", today),
    supabase
      .from("expenses")
      .select("amount, expense_date")
      .gte("expense_date", trendStart)
      .lte("expense_date", today),
    supabase
      .from("expenses")
      .select("id, amount, category, description, expense_date")
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const monthExpenses = monthRes.data ?? [];
  const trendExpenses = trendRes.data ?? [];
  const recentExpenses = (recentRes.data ?? []) as ExpenseRow[];

  const todayTotal = monthExpenses
    .filter((e) => e.expense_date === today)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const avgDaily = monthTotal / dayOfMonthInLima();

  const categoryMap = new Map<Category, number>();
  for (const e of monthExpenses) {
    const category = e.category as Category;
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + Number(e.amount));
  }
  const categoryTotals: CategoryTotal[] = Array.from(categoryMap.entries()).map(
    ([category, total]) => ({ category, total })
  );

  const trendMap = new Map<string, number>();
  for (const e of trendExpenses) {
    trendMap.set(e.expense_date, (trendMap.get(e.expense_date) ?? 0) + Number(e.amount));
  }
  const trendData: TrendPoint[] = lastNDays(30).map((date) => ({
    date,
    total: trendMap.get(date) ?? 0,
  }));

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">
            Bóveda
          </p>
          <h1 className="font-display text-xl font-semibold text-ink">
            {user.email}
          </h1>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-[8px] border border-line px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-gold hover:text-ink"
          >
            Salir
          </button>
        </form>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <StatTile label="Hoy" amount={todayTotal} />
        <StatTile label="Este mes" amount={monthTotal} highlight />
        <StatTile
          label="Promedio diario"
          amount={avgDaily}
          hint={`${dayOfMonthInLima()} días transcurridos`}
        />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Nuevo gasto
        </h2>
        <AddExpenseForm />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Por categoría · este mes
        </h2>
        <CategoryPieChart data={categoryTotals} />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Tendencia · últimos 30 días
        </h2>
        <TrendChart data={trendData} />
      </section>

      <section className="vault-card px-6 py-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Gastos recientes
        </h2>
        <ExpenseList expenses={recentExpenses} />
      </section>
    </main>
  );
}
