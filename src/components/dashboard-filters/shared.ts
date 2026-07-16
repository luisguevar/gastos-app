import { daysAgoInLima, startOfMonthInLima, todayInLima } from "@/lib/date";

export type Preset = "hoy" | "semana" | "mes" | "custom";

export function presetRange(preset: Exclude<Preset, "custom">): { from: string; to: string } {
  const today = todayInLima();
  switch (preset) {
    case "hoy":
      return { from: today, to: today };
    case "semana":
      return { from: daysAgoInLima(6), to: today };
    case "mes":
    default:
      return { from: startOfMonthInLima(), to: today };
  }
}

/** Determina qué preset representa el rango actual, o "custom" si no calza
 * con ninguno de los tres rápidos. */
export function detectPreset(from: string, to: string): Preset {
  const presets: Exclude<Preset, "custom">[] = ["hoy", "semana", "mes"];
  for (const p of presets) {
    const r = presetRange(p);
    if (r.from === from && r.to === to) return p;
  }
  return "custom";
}

export const DEFAULT_FILTERS = {
  categoryId: "",
  tagId: "",
  paymentTypeId: "",
};

export function isDefaultState(
  preset: Preset,
  categoryId: string,
  tagId: string,
  paymentTypeId: string
): boolean {
  return preset === "mes" && !categoryId && !tagId && !paymentTypeId;
}
