const TIME_ZONE = "America/Lima";

/** Fecha de hoy como "YYYY-MM-DD" en la zona horaria de Perú. */
export function todayInLima(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Primer día del mes actual (Lima) como "YYYY-MM-DD". */
export function startOfMonthInLima(): string {
  const today = todayInLima();
  return `${today.slice(0, 7)}-01`;
}

/** "YYYY-MM-DD" de hace `days` días atrás, en Lima. */
export function daysAgoInLima(days: number): string {
  const today = todayInLima();
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Ayer como "YYYY-MM-DD" (Lima). */
export function yesterdayInLima(): string {
  return daysAgoInLima(1);
}

/** Día del mes de hoy (1-31), usado para el promedio diario. */
export function dayOfMonthInLima(): number {
  return Number(todayInLima().slice(8, 10));
}

/** Año actual (Lima). */
export function currentYearInLima(): number {
  return Number(todayInLima().slice(0, 4));
}

/** Primer día del mes con desfase `offset` (0 = este mes, -1 = mes pasado). */
export function monthStart(offset = 0): string {
  const today = todayInLima();
  let y = Number(today.slice(0, 4));
  let m = Number(today.slice(5, 7)) + offset;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

/** Último día del mes con desfase `offset` como "YYYY-MM-DD". */
export function monthEnd(offset = 0): string {
  const start = monthStart(offset);
  const y = Number(start.slice(0, 4));
  const m = Number(start.slice(5, 7));
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const d = new Date(Date.UTC(nextY, nextM - 1, 1));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Día del mes (1-31) de un "YYYY-MM-DD". */
export function dayOfMonth(date: string): number {
  return Number(date.slice(8, 10));
}

/** Genera un arreglo de "YYYY-MM-DD" de los últimos `days` días, incluyendo hoy. */
export function lastNDays(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(daysAgoInLima(i));
  }
  return dates;
}

/** Días entre dos "YYYY-MM-DD" (ambos extremos inclusive), mínimo 1. */
export function daysBetweenInclusive(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  const days = Math.round((b - a) / 86_400_000) + 1;
  return Math.max(1, days);
}
