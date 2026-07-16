"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/format";

export type TrendPoint = {
  date: string;
  total: number;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const { date, total } = payload[0].payload;
  return (
    <div className="vault-card px-3 py-2 text-xs">
      <p className="text-ink-muted">{formatDate(date)}</p>
      <p className="tabular font-semibold text-ink">{formatCurrency(total)}</p>
    </div>
  );
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const tickIndices = new Set(
    [0, Math.floor(data.length / 2), data.length - 1].filter(
      (i) => i >= 0 && i < data.length
    )
  );

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            tickFormatter={(value) => formatDate(value).slice(0, 5)}
            ticks={data
              .filter((_, i) => tickIndices.has(i))
              .map((d) => d.date)}
            interval={0}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--gold)"
            strokeWidth={2}
            fill="url(#trendFill)"
            dot={false}
            activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2, fill: "var(--gold)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
