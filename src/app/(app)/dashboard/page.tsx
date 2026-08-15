import {
  IconArrowsRightLeft,
  IconCalendarStats,
  IconUser,
  IconWallet,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { getExpenses } from "@/lib/queries";
import {
  currentYearInLima,
  dayOfMonth,
  lastNDays,
  monthEnd,
  monthStart,
  todayInLima,
  yesterdayInLima,
} from "@/lib/date";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { DailyBarChart } from "@/components/charts/daily-bar-chart";
import { MonthlyLineChart } from "@/components/charts/monthly-line-chart";
import { PaceLineChart } from "@/components/charts/pace-line-chart";
import { CategoryRanking, type CatRow } from "@/components/dashboard/category-ranking";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import type { ExpenseRow } from "@/lib/types";

export const dynamic = "force-dynamic";

const DOW = ["D", "L", "M", "M", "J", "V", "S"];
const MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function sum(rows: ExpenseRow[], pred?: (e: ExpenseRow) => boolean): number {
  return rows.reduce((s, e) => s + (!pred || pred(e) ? e.amount : 0), 0);
}

function pct(cur: number, prev: number): number | null {
  if (prev <= 0) return null;
  return ((cur - prev) / prev) * 100;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = todayInLima();
  const yesterday = yesterdayInLima();
  const monthFrom = monthStart(0);
  const prevFrom = monthStart(-1);
  const prevTo = monthEnd(-1);
  const year = currentYearInLima();

  const [yearPersonal, monthAll, prevMonthAll] = await Promise.all([
    getExpenses(supabase, { dateFrom: `${year}-01-01`, dateTo: today, isLoan: false }),
    getExpenses(supabase, { dateFrom: monthFrom, dateTo: today }),
    getExpenses(supabase, { dateFrom: prevFrom, dateTo: prevTo }),
  ]);

  // KPIs
  const totalMes = sum(monthAll);
  const totalPrev = sum(prevMonthAll);
  const personalMes = sum(monthAll, (e) => !e.is_loan);
  const personalPrev = sum(prevMonthAll, (e) => !e.is_loan);
  const prestadoMes = sum(monthAll, (e) => e.is_loan);
  const prestadoPrev = sum(prevMonthAll, (e) => e.is_loan);
  const hoy = sum(monthAll, (e) => e.expense_date === today);
  const ayer = sum([...monthAll, ...prevMonthAll], (e) => e.expense_date === yesterday);

  // Gráfico 1: últimos 7 días (gasto personal)
  const byDay = new Map<string, number>();
  for (const e of yearPersonal) byDay.set(e.expense_date, (byDay.get(e.expense_date) ?? 0) + e.amount);
  const days7 = lastNDays(7);
  const dailyData = days7.map((d) => ({
    label: DOW[new Date(`${d}T00:00:00Z`).getUTCDay()],
    total: byDay.get(d) ?? 0,
  }));
  const total7 = dailyData.reduce((s, d) => s + d.total, 0);

  // Gráfico 2: gasto mensual del año (personal)
  const byMonth = new Array(12).fill(0) as number[];
  for (const e of yearPersonal) byMonth[Number(e.expense_date.slice(5, 7)) - 1] += e.amount;
  const monthlyData = byMonth.map((total, i) => ({ label: MES[i], total }));

  // Gráfico 3: ritmo del mes — acumulado este mes vs mes anterior (personal)
  const daysThis = dayOfMonth(today);
  const prevDays = dayOfMonth(prevTo);
  const curByDay = new Array(32).fill(0) as number[];
  const prvByDay = new Array(32).fill(0) as number[];
  for (const e of yearPersonal) {
    if (e.expense_date >= monthFrom && e.expense_date <= today) curByDay[dayOfMonth(e.expense_date)] += e.amount;
  }
  for (const e of prevMonthAll) {
    if (!e.is_loan) prvByDay[dayOfMonth(e.expense_date)] += e.amount;
  }
  const maxDays = Math.max(daysThis, prevDays);
  let ca = 0;
  let pa = 0;
  const paceData = [];
  for (let d = 1; d <= maxDays; d++) {
    ca += curByDay[d];
    pa += prvByDay[d];
    paceData.push({
      day: d,
      actual: d <= daysThis ? ca : null,
      previo: d <= prevDays ? pa : null,
    });
  }
  let prevCumSame = 0;
  for (let d = 1; d <= Math.min(daysThis, prevDays); d++) prevCumSame += prvByDay[d];
  const paceDelta = pct(personalMes, prevCumSame);
  const paceFooter =
    paceDelta === null
      ? "sin datos del mes anterior"
      : paceDelta > 0
        ? `vas ${Math.abs(Math.round(paceDelta))}% por encima del mes pasado`
        : paceDelta < 0
          ? `vas ${Math.abs(Math.round(paceDelta))}% por debajo del mes pasado`
          : "igual que el mes pasado";

  // Categorías del mes (personal)
  const catMap = new Map<string, { id: string; name: string; icon: string | null; total: number }>();
  for (const e of monthAll) {
    if (e.is_loan) continue;
    const c = catMap.get(e.category_id);
    if (c) c.total += e.amount;
    else catMap.set(e.category_id, { id: e.category_id, name: e.category_name, icon: e.category_icon, total: e.amount });
  }
  const cats = Array.from(catMap.values()).sort((a, b) => b.total - a.total);
  const catTotal = cats.reduce((s, c) => s + c.total, 0);
  const maxCat = cats[0]?.total ?? 0;
  const catRows: CatRow[] = cats.slice(0, 6).map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    total: c.total,
    pct: catTotal > 0 ? (c.total / catTotal) * 100 : 0,
    widthPct: maxCat > 0 ? (c.total / maxCat) * 100 : 0,
  }));

  // Últimos gastos (personal, más recientes)
  const recientes = yearPersonal.slice(0, 6);

  return (
    <>
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Bóveda</p>
        <h1 className="font-display text-xl font-semibold text-ink">Dashboard</h1>
      </header>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Consumo total"
          value={totalMes}
          icon={IconWallet}
          gradient="var(--grad-dark)"
          deltaPct={pct(totalMes, totalPrev)}
          periodLabel="vs. mes anterior"
        />
        <KpiCard
          label="Consumo personal"
          value={personalMes}
          icon={IconUser}
          gradient="var(--grad-verde)"
          deltaPct={pct(personalMes, personalPrev)}
          periodLabel="vs. mes anterior"
        />
        <KpiCard
          label="Consumo de hoy"
          value={hoy}
          icon={IconCalendarStats}
          gradient="var(--grad-azul)"
          deltaPct={pct(hoy, ayer)}
          periodLabel="vs. ayer"
        />
        <KpiCard
          label="Total prestado"
          value={prestadoMes}
          icon={IconArrowsRightLeft}
          gradient="var(--grad-morado)"
          deltaPct={pct(prestadoMes, prestadoPrev)}
          periodLabel="vs. mes anterior"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard
          tone="azul"
          title="Últimos 7 días"
          subtitle="Cuánto gastaste cada día esta semana."
          footer={`Total S/ ${total7.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        >
          <p className="mb-2 text-[12px] font-medium opacity-90">Gasto diario · S/</p>
          <DailyBarChart data={dailyData} />
        </ChartCard>

        <ChartCard
          tone="verde"
          title="Este año"
          subtitle="Evolución mes a mes de tu consumo."
          footer={`Hasta ${MES[Number(today.slice(5, 7)) - 1].toLowerCase()}`}
        >
          <p className="mb-2 text-[12px] font-medium opacity-90">Gasto mensual · S/</p>
          <MonthlyLineChart data={monthlyData} />
        </ChartCard>

        <ChartCard
          tone="dark"
          title="Ritmo del mes"
          subtitle="Acumulado de este mes vs. el mes anterior."
          footer={paceFooter}
        >
          <p className="mb-2 text-[12px] font-medium opacity-90">Acumulado · S/</p>
          <PaceLineChart data={paceData} />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="vault-card px-6 py-5 lg:col-span-2">
          <h2 className="font-display text-base font-semibold text-ink">Gasto por categoría</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Este mes · ordenado por monto</p>
          <CategoryRanking rows={catRows} />
        </div>

        <div className="vault-card px-6 py-5">
          <h2 className="font-display text-base font-semibold text-ink">Últimos gastos</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Tus movimientos más recientes</p>
          <RecentExpenses expenses={recientes} />
        </div>
      </section>
    </>
  );
}
