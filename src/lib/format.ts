export function formatCurrency(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
