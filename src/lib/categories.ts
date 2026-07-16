export const CATEGORIES = [
  "Comida",
  "Transporte",
  "Vivienda",
  "Entretenimiento",
  "Salud",
  "Compras",
  "Servicios",
  "Otros",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Paleta categórica fija (grises azulados discretos, orden fijo, sin ciclar).
// El dorado se reserva aparte para resaltar la categoría de mayor gasto
// (ver CategoryPieChart). Valores de --cat-* definidos en globals.css.
export const CATEGORY_VAR: Record<Category, string> = {
  Comida: "var(--cat-1)",
  Transporte: "var(--cat-2)",
  Vivienda: "var(--cat-3)",
  Entretenimiento: "var(--cat-4)",
  Salud: "var(--cat-5)",
  Compras: "var(--cat-6)",
  Servicios: "var(--cat-7)",
  Otros: "var(--cat-8)",
};
