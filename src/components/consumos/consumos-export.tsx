"use client";

import { useTransition } from "react";
import { IconDownload } from "@tabler/icons-react";
import { getConsumosForExport } from "@/app/actions/export";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { ExpenseFilters } from "@/lib/queries";

export function ConsumosExport({ filters }: { filters: ExpenseFilters }) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const rows = await getConsumosForExport(filters);
      downloadCsv(`consumos-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    });
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-card px-3.5 py-2 text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-50"
    >
      <IconDownload size={16} />
      {isPending ? "Exportando…" : "CSV"}
    </button>
  );
}
