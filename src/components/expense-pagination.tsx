import Link from "next/link";

function buildHref(page: number, search: string): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/gastos?${query}` : "/gastos";
}

export function ExpensePagination({
  page,
  totalPages,
  search,
}: {
  page: number;
  totalPages: number;
  search: string;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
      {hasPrev ? (
        <Link
          href={buildHref(page - 1, search)}
          className="rounded-[8px] border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          ← Anterior
        </Link>
      ) : (
        <span className="rounded-[8px] border border-line px-3 py-1.5 text-xs text-ink-muted opacity-40">
          ← Anterior
        </span>
      )}

      <span className="text-xs text-ink-muted">
        Página {page} de {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(page + 1, search)}
          className="rounded-[8px] border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          Siguiente →
        </Link>
      ) : (
        <span className="rounded-[8px] border border-line px-3 py-1.5 text-xs text-ink-muted opacity-40">
          Siguiente →
        </span>
      )}
    </div>
  );
}
