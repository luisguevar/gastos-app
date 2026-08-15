"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatCurrency } from "@/lib/format";

export type MonthlyPoint = { label: string; total: number };

function TT({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: MonthlyPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const { label, total } = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-ink-muted">{label}</p>
      <p className="tabular font-semibold text-ink">{formatCurrency(total)}</p>
    </div>
  );
}

export function MonthlyLineChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <div className="h-[128px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
          <defs>
            <linearGradient id="monthlyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 9, fill: "rgba(255,255,255,0.8)" }}
            interval={0}
          />
          <Tooltip content={<TT />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#ffffff"
            strokeWidth={2.5}
            fill="url(#monthlyFill)"
            dot={false}
            activeDot={{ r: 4, fill: "#ffffff", stroke: "rgba(0,0,0,0.15)", strokeWidth: 1 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
