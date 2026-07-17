import { formatDate } from "@/lib/format";
import type { ExpenseRow } from "@/lib/types";

const HEADERS = [
  "Fecha",
  "Descripción",
  "Categoría",
  "Monto",
  "Tipo de pago",
  "Cuenta/Tarjeta",
  "Etiquetas",
];

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(expenses: ExpenseRow[]): string {
  const rows = expenses.map((expense) => [
    formatDate(expense.expense_date),
    expense.description ?? "",
    expense.category_name,
    expense.amount.toFixed(2),
    expense.payment_type_name,
    expense.payment_account_name ?? "",
    expense.tags.map((t) => t.name).join(";"),
  ]);

  return [HEADERS, ...rows]
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
