"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_VAR, type Category } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

export type CategoryTotal = {
  category: Category;
  total: number;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: CategoryTotal & { sharePercent: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const { category, total, sharePercent } = payload[0].payload;
  return (
    <div className="vault-card px-3 py-2 text-xs">
      <p className="font-semibold text-ink">{category}</p>
      <p className="tabular text-ink-muted">
        {formatCurrency(total)} · {sharePercent.toFixed(0)}%
      </p>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: CategoryTotal[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-muted">
        No hay gastos este mes todavía.
      </p>
    );
  }

  const grandTotal = data.reduce((sum, d) => sum + d.total, 0);
  const topCategory = data.reduce((max, d) => (d.total > max.total ? d : max), data[0])
    .category;
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
              nameKey="category"
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
                  key={entry.category}
                  fill={
                    entry.category === topCategory
                      ? "var(--gold)"
                      : CATEGORY_VAR[entry.category]
                  }
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
            <li key={entry.category} className="vault-line py-1.5 text-sm">
              <span className="flex items-center gap-2 text-ink">
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      entry.category === topCategory
                        ? "var(--gold)"
                        : CATEGORY_VAR[entry.category],
                  }}
                />
                {entry.category}
              </span>
              <span className="vault-dots" />
              <span
                className={`tabular shrink-0 ${
                  entry.category === topCategory ? "text-gold font-medium" : "text-ink"
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
