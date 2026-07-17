"use client";

import { useTransition } from "react";
import { IconDownload } from "@tabler/icons-react";
import { getExpensesForExport } from "@/app/actions/export";
import { toCsv, downloadCsv } from "@/lib/csv";
import { todayInLima } from "@/lib/date";

export function ExportCsvButton({ search }: { search: string }) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const expenses = await getExpensesForExport(search);
      const csv = toCsv(expenses);
      downloadCsv(`gastos_${todayInLima()}.csv`, csv);
    });
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-[8px] border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink disabled:opacity-60"
    >
      <IconDownload size={14} />
      {isPending ? "Exportando…" : "Exportar CSV"}
    </button>
  );
}
