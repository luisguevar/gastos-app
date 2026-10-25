import { createClient } from "@/lib/supabase/server";
import {
  getCategories,
  getConsumosSummary,
  getExpensesPage,
  getPaymentAccounts,
  getPaymentTypes,
  getPeople,
  getTags,
  type ExpenseFilters,
} from "@/lib/queries";
import { daysAgoInLima, startOfMonthInLima, todayInLima } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { ConsumosFilters, type ConsumosFilterValues } from "@/components/consumos/consumos-filters";
import { ConsumosTable } from "@/components/consumos/consumos-table";
import { ConsumosHeaderActions } from "@/components/consumos/consumos-header-actions";
import { ConsumosNav, PendingOverlay, ConsumosPager } from "@/components/consumos/consumos-nav";
import type { Category, PaymentAccount, PaymentType, Person, Tag } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

type SearchParams = {
  tipo?: string;
  q?: string;
  cat?: string;
  etiqueta?: string;
  tagmode?: string;
  pago?: string;
  persona?: string;
  estado?: string;
  periodo?: string;
  from?: string;
  to?: string;
  page?: string;
};

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

function periodRange(periodo: string, from: string, to: string): { from?: string; to?: string } {
  const today = todayInLima();
  switch (periodo) {
    case "hoy":
      return { from: today, to: today };
    case "semana":
      return { from: daysAgoInLima(6), to: today };
    case "todo":
      return {};
    case "rango":
      return { from: from || undefined, to: to || undefined };
    case "mes":
    default:
      return { from: startOfMonthInLima(), to: today };
  }
}

export default async function ConsumosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  const tipo = searchParams.tipo === "gastos" || searchParams.tipo === "prestamos" ? searchParams.tipo : "todos";
  const q = searchParams.q?.trim() ?? "";
  const cat = searchParams.cat ?? "";
  const etiquetas = (searchParams.etiqueta ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const tagMode = searchParams.tagmode === "all" ? "all" : "any";
  const pago = searchParams.pago ?? "";
  const persona = searchParams.persona ?? "";
  const estado = searchParams.estado === "pagados" || searchParams.estado === "pendientes" ? searchParams.estado : "";
  const periodo = searchParams.periodo ?? "mes";
  const from = searchParams.from ?? "";
  const to = searchParams.to ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const range = periodRange(periodo, from, to);
  const isLoan = tipo === "gastos" ? false : tipo === "prestamos" ? true : undefined;
  const paid = estado === "pagados" ? true : estado === "pendientes" ? false : undefined;

  const filters: ExpenseFilters = {
    dateFrom: range.from,
    dateTo: range.to,
    search: q || undefined,
    categoryId: cat || undefined,
    tagIds: etiquetas.length ? etiquetas : undefined,
    tagMode,
    paymentTypeId: pago || undefined,
    personId: persona || undefined,
    isLoan,
    paid,
  };

  const [
    allCategories,
    allPaymentTypes,
    allPeople,
    allTags,
    activeCategories,
    activePaymentTypes,
    activePaymentAccounts,
    activeTags,
    activePeople,
    summary,
    pageResult,
  ] = await Promise.all([
    getCategories(supabase),
    getPaymentTypes(supabase),
    getPeople(supabase),
    getTags(supabase),
    getCategories(supabase, { activeOnly: true }),
    getPaymentTypes(supabase, { activeOnly: true }),
    getPaymentAccounts(supabase, { activeOnly: true }),
    getTags(supabase, { activeOnly: true }),
    getPeople(supabase, { activeOnly: true }),
    getConsumosSummary(supabase, filters),
    getExpensesPage(supabase, { ...filters, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
  ]);

  const rows = pageResult.expenses;
  const total = pageResult.total;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const sumBy = (pred?: (r: (typeof summary)[number]) => boolean) =>
    summary.reduce((s, r) => s + (!pred || pred(r) ? r.amount : 0), 0);
  const totalMonto = sumBy();
  const gastos = sumBy((r) => !r.is_loan);
  const prestado = sumBy((r) => r.is_loan);
  const porCobrar = sumBy((r) => r.is_loan && !r.loan_paid);
  const cobrado = sumBy((r) => r.is_loan && r.loan_paid);

  type Chip = { label: string; value: string; accent?: "gold" | "danger" };
  let chips: Chip[];
  if (tipo === "gastos") {
    chips = [
      { label: "Gastos", value: formatCurrency(gastos) },
      { label: "Registros", value: String(total) },
    ];
  } else if (tipo === "prestamos") {
    chips = [
      { label: "Prestado", value: formatCurrency(prestado) },
      { label: "Por cobrar", value: formatCurrency(porCobrar), accent: "danger" },
      { label: "Cobrado", value: formatCurrency(cobrado), accent: "gold" },
      { label: "Registros", value: String(total) },
    ];
  } else {
    chips = [
      { label: "Total del período", value: formatCurrency(totalMonto) },
      { label: "Gastos", value: formatCurrency(gastos) },
      { label: "Prestado", value: formatCurrency(prestado) },
      { label: "Por cobrar", value: formatCurrency(porCobrar), accent: "danger" },
      { label: "Registros", value: String(total) },
    ];
  }

  const debtors: { id: string; name: string; total: number }[] = [];
  if (tipo === "prestamos") {
    const personName = new Map(allPeople.map((p) => [p.id, p.name]));
    const m = new Map<string, { id: string; name: string; total: number }>();
    for (const r of summary) {
      if (!r.is_loan || r.loan_paid || !r.loan_person_id) continue;
      const c = m.get(r.loan_person_id);
      if (c) c.total += r.amount;
      else m.set(r.loan_person_id, { id: r.loan_person_id, name: personName.get(r.loan_person_id) ?? "—", total: r.amount });
    }
    debtors.push(...Array.from(m.values()).sort((a, b) => b.total - a.total));
  }

  const usedCategories = rows.map((r) => ({ id: r.category_id, name: r.category_name }));
  const usedPaymentTypes = rows.map((r) => ({ id: r.payment_type_id, name: r.payment_type_name }));
  const usedPaymentAccounts = rows.filter((r) => r.payment_account_id).map((r) => ({ id: r.payment_account_id as string, name: r.payment_account_name as string }));
  const usedTags = rows.flatMap((r) => r.tags);
  const usedPeople = rows.filter((r) => r.loan_person_id).map((r) => ({ id: r.loan_person_id as string, name: r.loan_person_name as string }));

  const categoriesForForm = mergeActiveWithUsed<Category>(activeCategories, usedCategories);
  const paymentTypesForForm = mergeActiveWithUsed<PaymentType>(activePaymentTypes, usedPaymentTypes);
  const paymentAccountsForForm = mergeActiveWithUsed<PaymentAccount>(activePaymentAccounts, usedPaymentAccounts);
  const tagsForForm = mergeActiveWithUsed<Tag>(activeTags, usedTags);
  const peopleForForm = mergeActiveWithUsed<Person>(activePeople, usedPeople);

  const showLoanCols = tipo !== "gastos";

  function hrefForPage(p: number): string {
    const params = new URLSearchParams();
    if (tipo !== "todos") params.set("tipo", tipo);
    if (q) params.set("q", q);
    if (cat) params.set("cat", cat);
    if (etiquetas.length) params.set("etiqueta", etiquetas.join(","));
    if (tagMode === "all") params.set("tagmode", "all");
    if (pago) params.set("pago", pago);
    if (persona) params.set("persona", persona);
    if (estado) params.set("estado", estado);
    if (periodo !== "mes") params.set("periodo", periodo);
    if (periodo === "rango") {
      if (from) params.set("from", from);
      if (to) params.set("to", to);
    }
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/consumos?${s}` : "/consumos";
  }
  const prevHref = safePage > 1 ? hrefForPage(safePage - 1) : null;
  const nextHref = safePage < totalPages ? hrefForPage(safePage + 1) : null;

  const selectedTagIds = new Set(etiquetas);
  const filterTags = allTags.filter((t) => t.activa || selectedTagIds.has(t.id));
  // Los demás filtros también muestran solo activos (más el seleccionado).
  const filterCategories = allCategories.filter((c) => c.activa || c.id === cat);
  const filterPaymentTypes = allPaymentTypes.filter((p) => p.activa || p.id === pago);
  const filterPeople = allPeople.filter((p) => p.activa || p.id === persona);

  const filterValues: ConsumosFilterValues = { tipo, q, cat, etiquetas, tagMode, pago, persona, estado, periodo, from, to };

  return (
    <ConsumosNav>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Bóveda</p>
          <h1 className="font-display text-xl font-semibold text-ink">Consumos</h1>
        </div>
        <ConsumosHeaderActions
          categories={categoriesForForm}
          paymentTypes={paymentTypesForForm}
          paymentAccounts={paymentAccountsForForm}
          tags={tagsForForm}
          people={peopleForForm}
          exportFilters={filters}
        />
      </header>

      <section className="vault-card flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
        {chips.map((c) => (
          <div key={c.label}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted">{c.label}</div>
            <div
              className={`font-display tabular mt-0.5 text-lg font-bold ${
                c.accent === "danger" ? "text-danger-ink" : c.accent === "gold" ? "text-gold" : "text-ink"
              }`}
            >
              {c.value}
            </div>
          </div>
        ))}
      </section>

      <ConsumosFilters
        values={filterValues}
        categories={filterCategories}
        tags={filterTags}
        paymentTypes={filterPaymentTypes}
        people={filterPeople}
      />

      <PendingOverlay>
        {tipo === "prestamos" && debtors.length > 0 ? (
          <section className="vault-card mb-6 px-6 py-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">Te deben</h2>
            <ul className="flex flex-col">
              {debtors.map((d) => (
                <li key={d.id} className="vault-line items-center border-b border-dashed border-line py-2 last:border-b-0">
                  <span className="text-sm text-ink">{d.name}</span>
                  <span className="vault-dots" />
                  <span className="font-display tabular shrink-0 text-sm font-medium text-ink">{formatCurrency(d.total)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="vault-card px-5 py-4">
          <ConsumosTable
            rows={rows}
            categories={categoriesForForm}
            paymentTypes={paymentTypesForForm}
            paymentAccounts={paymentAccountsForForm}
            tags={tagsForForm}
            people={peopleForForm}
            showLoanCols={showLoanCols}
            emptyLabel={total === 0 ? "Aún no registras consumos." : "No hay consumos con este filtro."}
          />
          <ConsumosPager
            page={safePage}
            totalPages={totalPages}
            total={total}
            prevHref={prevHref}
            nextHref={nextHref}
          />
        </section>
      </PendingOverlay>
    </ConsumosNav>
  );
}
