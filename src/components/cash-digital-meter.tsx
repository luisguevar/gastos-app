import { formatCurrency } from "@/lib/format";

// Colores por rol (adaptan a claro/oscuro vía tokens): digital = verde de
// acción, efectivo = neutro.
const CASH_COLOR = "var(--neutral)";
const DIGITAL_COLOR = "var(--gold)";

function LegendRow({
  color,
  label,
  amount,
  pct,
  emphasize,
}: {
  color: string;
  label: string;
  amount: number;
  pct: number;
  emphasize: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, color: "var(--text)" }}>{label}</span>
      </span>
      <span style={{ whiteSpace: "nowrap" }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: emphasize ? 500 : 400,
            color: emphasize ? "var(--text)" : "var(--text-muted)",
          }}
        >
          {formatCurrency(amount)}
        </span>
        <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-muted)" }}>
          {" "}
          · {pct.toFixed(0)}%
        </span>
      </span>
    </div>
  );
}

export function CashDigitalMeter({ cash, digital }: { cash: number; digital: number }) {
  const total = cash + digital;
  const cashPct = total > 0 ? (cash / total) * 100 : 0;
  const digitalPct = total > 0 ? 100 - cashPct : 0;

  const roundedCashPct = Math.round(cashPct);
  const roundedDigitalPct = Math.round(digitalPct);
  const cashEmphasis = roundedCashPct >= roundedDigitalPct;
  const digitalEmphasis = roundedDigitalPct >= roundedCashPct;

  return (
    <div className="vault-card" style={{ padding: 16 }}>
      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.05em",
          color: "var(--text-muted)",
          fontWeight: 500,
          marginBottom: 16,
          textTransform: "uppercase",
        }}
      >
        Efectivo vs. digital
      </p>

      {total === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          No hay gastos en este período.
        </p>
      ) : (
        <>
          <div
            style={{
              height: 10,
              borderRadius: 5,
              overflow: "hidden",
              display: "flex",
              marginBottom: 14,
              backgroundColor: "var(--track)",
            }}
          >
            <div
              style={{
                width: `${cashPct}%`,
                minWidth: cashPct === 0 ? 2 : undefined,
                backgroundColor: CASH_COLOR,
              }}
            />
            <div
              style={{
                width: `${digitalPct}%`,
                minWidth: digitalPct === 0 ? 2 : undefined,
                backgroundColor: DIGITAL_COLOR,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <LegendRow color={CASH_COLOR} label="Efectivo" amount={cash} pct={cashPct} emphasize={cashEmphasis} />
            <LegendRow color={DIGITAL_COLOR} label="Digital" amount={digital} pct={digitalPct} emphasize={digitalEmphasis} />
          </div>
        </>
      )}
    </div>
  );
}
