"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatCurrency } from "@/lib/format";

export type DailyPoint = { label: string; total: number };

function TT({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DailyPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const { total } = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lg">
      <p className="tabular font-semibold text-ink">{formatCurrency(total)}</p>
    </div>
  );
}

export function DailyBarChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="h-[128px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.85)" }}
            interval={0}
          />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.12)" }} content={<TT />} />
          <Bar dataKey="total" fill="rgba(255,255,255,0.9)" radius={[4, 4, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
