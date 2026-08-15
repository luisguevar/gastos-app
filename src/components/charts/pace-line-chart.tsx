"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatCurrency } from "@/lib/format";

export type PacePoint = { day: number; actual: number | null; previo: number | null };

function TT({
  active,
  payload,
  label,
}: {
  active?: boolean;
  label?: number;
  payload?: { dataKey: string; value: number | null }[];
}) {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === "actual")?.value ?? null;
  const previo = payload.find((p) => p.dataKey === "previo")?.value ?? null;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-ink-muted">Día {label}</p>
      {actual !== null ? (
        <p className="tabular font-semibold text-ink">Este mes · {formatCurrency(actual)}</p>
      ) : null}
      {previo !== null ? (
        <p className="tabular text-ink-muted">Mes pasado · {formatCurrency(previo)}</p>
      ) : null}
    </div>
  );
}

export function PaceLineChart({ data }: { data: PacePoint[] }) {
  return (
    <div className="h-[128px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 6, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 9, fill: "rgba(255,255,255,0.7)" }}
            interval="preserveStartEnd"
          />
          <Tooltip content={<TT />} />
          <Line
            type="monotone"
            dataKey="previo"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#ffffff"
            strokeWidth={2.6}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
