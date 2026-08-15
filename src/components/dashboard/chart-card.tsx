import type { ReactNode } from "react";

const GRADIENTS: Record<string, string> = {
  azul: "var(--grad-azul)",
  verde: "var(--grad-verde)",
  dark: "var(--grad-dark)",
};

export function ChartCard({
  tone,
  title,
  subtitle,
  footer,
  children,
}: {
  tone: "azul" | "verde" | "dark";
  title: string;
  subtitle: string;
  footer: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-line bg-card p-3.5">
      <div
        className="rounded-[12px] px-3 pb-2 pt-3 text-white"
        style={{ backgroundImage: GRADIENTS[tone] }}
      >
        {children}
      </div>
      <div className="px-1 pt-3">
        <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
        <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
        <p className="mt-2.5 border-t border-line pt-2.5 text-[11px] text-ink-muted">{footer}</p>
      </div>
    </div>
  );
}
