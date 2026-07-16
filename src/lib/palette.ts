// Paleta categórica fija (grises azulados discretos) para catálogos
// dinámicos por usuario (categorías, tipos de pago). El color se asigna por
// posición estable (orden de creación), no por identidad fija de nombre,
// porque el usuario puede crear categorías nuevas en cualquier momento.
// El dorado se reserva aparte para resaltar la entidad de mayor gasto
// (ver CategoryPieChart) — nunca forma parte de este ciclo.
export const CATEGORY_PALETTE = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
  "var(--cat-6)",
  "var(--cat-7)",
  "var(--cat-8)",
] as const;

export function colorForIndex(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
}

/** Mapa id → color estable, por orden de creación (nunca por rank de gasto). */
export function buildColorMap(items: { id: string }[]): Map<string, string> {
  const map = new Map<string, string>();
  items.forEach((item, i) => map.set(item.id, colorForIndex(i)));
  return map;
}
