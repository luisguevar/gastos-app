"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/loader";

type NavCtx = {
  navigate: (url: string) => void;
  refresh: () => void;
  pending: boolean;
};

const Ctx = createContext<NavCtx>({
  navigate: () => {},
  refresh: () => {},
  pending: false,
});

export function useConsumosNav() {
  return useContext(Ctx);
}

/** Proveedor: envuelve la vista de Consumos y expone navegación/refresh con
 * estado `pending` compartido para mostrar el loader mientras carga. */
export function ConsumosNav({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const navigate = (url: string) => start(() => router.push(url));
  const refresh = () => start(() => router.refresh());
  return <Ctx.Provider value={{ navigate, refresh, pending }}>{children}</Ctx.Provider>;
}

/** Envuelve el área de resultados: la atenúa y muestra el loader cuando hay
 * una navegación/refresh en curso (filtros, paginación, alta de registros). */
export function PendingOverlay({ children }: { children: ReactNode }) {
  const { pending } = useConsumosNav();
  return (
    <div className="relative">
      <div className={pending ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
        {children}
      </div>
      {pending ? (
        <div className="absolute inset-0 z-10 flex items-start justify-center pt-20">
          <Loader label={null} size="lg" />
        </div>
      ) : null}
    </div>
  );
}

/** Paginación que dispara la navegación con loader. */
export function ConsumosPager({
  page,
  totalPages,
  total,
  prevHref,
  nextHref,
}: {
  page: number;
  totalPages: number;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
}) {
  const { navigate } = useConsumosNav();
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-ink-muted">
      <span>
        Página {page} de {totalPages} · {total} registros
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!prevHref}
          onClick={() => prevHref && navigate(prevHref)}
          className="rounded-[8px] border border-line px-3 py-1.5 transition-colors enabled:hover:text-ink disabled:opacity-40"
        >
          ← Anterior
        </button>
        <button
          type="button"
          disabled={!nextHref}
          onClick={() => nextHref && navigate(nextHref)}
          className="rounded-[8px] border border-line px-3 py-1.5 transition-colors enabled:hover:text-ink disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
