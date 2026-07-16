"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

export type CategoryTotal = {
  categoryId: string;
  categoryName: string;
  total: number;
  color: string;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: CategoryTotal & { sharePercent: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const { categoryName, total, sharePercent } = payload[0].payload;
  return (
    <div className="vault-card px-3 py-2 text-xs">
      <p className="font-semibold text-ink">{categoryName}</p>
      <p className="tabular text-ink-muted">
        {formatCurrency(total)} · {sharePercent.toFixed(0)}%
      </p>
    </div>
  );
}

export function CategoryPieChart({
  data,
  emptyLabel = "No hay gastos en este período.",
}: {
  data: CategoryTotal[];
  emptyLabel?: string;
}) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-muted">{emptyLabel}</p>;
  }

  const grandTotal = data.reduce((sum, d) => sum + d.total, 0);
  const topCategoryId = data.reduce((max, d) => (d.total > max.total ? d : max), data[0])
    .categoryId;
  const withPercent = data.map((d) => ({
    ...d,
    sharePercent: grandTotal > 0 ? (d.total / grandTotal) * 100 : 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={withPercent}
              dataKey="total"
              nameKey="categoryName"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              label={({ percent }) =>
                (percent ?? 0) * 100 >= 8 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ""
              }
              labelLine={false}
            >
              {withPercent.map((entry) => (
                <Cell
                  key={entry.categoryId}
                  fill={entry.categoryId === topCategoryId ? "var(--gold)" : entry.color}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-col">
        {withPercent
          .sort((a, b) => b.total - a.total)
          .map((entry) => (
            <li key={entry.categoryId} className="vault-line py-1.5 text-sm">
              <span className="flex items-center gap-2 text-ink">
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      entry.categoryId === topCategoryId ? "var(--gold)" : entry.color,
                  }}
                />
                {entry.categoryName}
              </span>
              <span className="vault-dots" />
              <span
                className={`tabular shrink-0 ${
                  entry.categoryId === topCategoryId ? "text-gold font-medium" : "text-ink"
                }`}
              >
                {formatCurrency(entry.total)}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
