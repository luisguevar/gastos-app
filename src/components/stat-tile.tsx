import { formatCurrency } from "@/lib/format";

export type StatTone = "verde" | "rojo" | "azul" | "morado" | "teal";

const TONE_BG: Record<StatTone, string> = {
  verde: "var(--grad-verde)",
  rojo: "var(--grad-rojo)",
  azul: "var(--grad-azul)",
  morado: "var(--grad-morado)",
  teal: "var(--grad-teal)",
};

export function StatTile({
  label,
  amount,
  hint,
  tone,
}: {
  label: string;
  amount: number;
  hint?: string;
  tone?: StatTone;
}) {
  // Card con degradado de color (dashboard). Texto blanco con una leve sombra
  // para asegurar legibilidad sobre el degradado.
  if (tone) {
    return (
      <div
        className="relative flex flex-col gap-1 overflow-hidden rounded-[10px] px-4 py-3 text-white"
        style={{ backgroundImage: TONE_BG[tone] }}
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/90">
          {label}
        </span>
        <span
          className="font-display tabular text-xl font-semibold leading-tight"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.28)" }}
        >
          {formatCurrency(amount)}
        </span>
        {hint ? <span className="text-[11px] text-white/80">{hint}</span> : null}
      </div>
    );
  }

  // Variante plana (por si se reutiliza fuera del dashboard).
  return (
    <div className="vault-card flex flex-col gap-1 px-4 py-3">
      <span className="text-[11px] uppercase tracking-[0.15em] text-ink-muted">
        {label}
      </span>
      <span className="font-display tabular text-xl font-semibold leading-tight text-ink">
        {formatCurrency(amount)}
      </span>
      {hint ? <span className="text-[11px] text-ink-muted">{hint}</span> : null}
    </div>
  );
}
