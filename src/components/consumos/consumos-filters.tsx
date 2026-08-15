"use client";

import { useEffect, useRef, useState } from "react";
import { useConsumosNav } from "@/components/consumos/consumos-nav";
import type { Catalog } from "@/lib/types";

export type ConsumosFilterValues = {
  tipo: string; // "todos" | "gastos" | "prestamos"
  q: string;
  cat: string;
  pago: string;
  persona: string;
  estado: string; // "" | "pendientes" | "pagados"
  periodo: string; // "hoy" | "semana" | "mes" | "todo"
};

function toQuery(v: ConsumosFilterValues): string {
  const p = new URLSearchParams();
  if (v.tipo && v.tipo !== "todos") p.set("tipo", v.tipo);
  if (v.q) p.set("q", v.q);
  if (v.cat) p.set("cat", v.cat);
  if (v.pago) p.set("pago", v.pago);
  if (v.persona) p.set("persona", v.persona);
  if (v.estado) p.set("estado", v.estado);
  if (v.periodo && v.periodo !== "mes") p.set("periodo", v.periodo);
  return p.toString();
}

const selClass =
  "rounded-[9px] border border-line bg-card px-3 py-2 text-xs text-ink outline-none transition-colors focus:border-gold";

export function ConsumosFilters({
  values,
  categories,
  paymentTypes,
  people,
}: {
  values: ConsumosFilterValues;
  categories: Catalog[];
  paymentTypes: Catalog[];
  people: Catalog[];
}) {
  const { navigate } = useConsumosNav();
  const [q, setQ] = useState(values.q);

  function nav(patch: Partial<ConsumosFilterValues>) {
    const qs = toQuery({ ...values, ...patch });
    navigate(qs ? `/consumos?${qs}` : "/consumos");
  }

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (q !== values.q) nav({ q });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const showLoanFilters = values.tipo !== "gastos";
  const tipos = [
    { k: "todos", l: "Todos" },
    { k: "gastos", l: "Gastos" },
    { k: "prestamos", l: "Préstamos" },
  ];
  const periodos = [
    { k: "hoy", l: "Hoy" },
    { k: "semana", l: "Semana" },
    { k: "mes", l: "Mes" },
    { k: "todo", l: "Todo" },
  ];

  return (
    <div className="vault-card flex flex-wrap items-center gap-3 px-4 py-3">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar descripción…"
        className="min-w-[200px] flex-1 rounded-[9px] border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-gold"
      />

      <div className="flex rounded-[9px] bg-bg p-[3px]">
        {tipos.map((t) => {
          const on = (values.tipo || "todos") === t.k;
          return (
            <button
              key={t.k}
              type="button"
              onClick={() => nav({ tipo: t.k })}
              className={`rounded-[7px] px-3 py-1.5 text-xs transition-colors ${
                on ? "bg-card font-semibold text-ink shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              {t.l}
            </button>
          );
        })}
      </div>

      <select value={values.cat} onChange={(e) => nav({ cat: e.target.value })} className={selClass}>
        <option value="">Categoría</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select value={values.pago} onChange={(e) => nav({ pago: e.target.value })} className={selClass}>
        <option value="">Método de pago</option>
        {paymentTypes.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {showLoanFilters ? (
        <>
          <select value={values.persona} onChange={(e) => nav({ persona: e.target.value })} className={selClass}>
            <option value="">Persona</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select value={values.estado} onChange={(e) => nav({ estado: e.target.value })} className={selClass}>
            <option value="">Estado</option>
            <option value="pendientes">Pendientes</option>
            <option value="pagados">Pagados</option>
          </select>
        </>
      ) : null}

      <div className="flex gap-1.5">
        {periodos.map((p) => {
          const on = (values.periodo || "mes") === p.k;
          return (
            <button
              key={p.k}
              type="button"
              onClick={() => nav({ periodo: p.k })}
              className={`rounded-[8px] border px-2.5 py-1.5 text-xs transition-colors ${
                on ? "border-gold bg-gold font-semibold text-gold-ink" : "border-line text-ink-muted hover:text-ink"
              }`}
            >
              {p.l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
