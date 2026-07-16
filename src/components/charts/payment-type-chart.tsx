"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";

export type PaymentTypeTotal = {
  id: string;
  name: string;
  total: number;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PaymentTypeTotal }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, total } = payload[0].payload;
  return (
    <div className="vault-card px-3 py-2 text-xs">
      <p className="font-semibold text-ink">{name}</p>
      <p className="tabular text-ink-muted">{formatCurrency(total)}</p>
    </div>
  );
}

export function PaymentTypeChart({ data }: { data: PaymentTypeTotal[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-muted">
        No hay gastos en este período.
      </p>
    );
  }

  const sorted = [...data].sort((a, b) => b.total - a.total);
  const height = Math.max(sorted.length * 40, 80);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 48, left: 0, bottom: 4 }}
          barCategoryGap={12}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--border)", opacity: 0.2 }} />
          <Bar dataKey="total" fill="var(--cat-4)" radius={[0, 4, 4, 0]} maxBarSize={20}>
            <LabelList
              dataKey="total"
              position="right"
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              style={{ fill: "var(--text)", fontSize: 11 }}
            />
            {sorted.map((entry) => (
              <Cell key={entry.id} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
