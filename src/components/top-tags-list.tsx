import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export type TopTag = {
  id: string;
  name: string;
  total: number;
};

export function TopTagsList({ tags }: { tags: TopTag[] }) {
  if (tags.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-muted">
        No hay gastos etiquetados en este período.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {tags.map((tag, i) => (
        <li key={tag.id} className="border-b border-dashed border-line py-2.5 last:border-b-0">
          <Link href={`/etiquetas/${tag.id}`} className="vault-line group items-center">
            <span className="flex items-center gap-2 text-sm text-ink transition-colors group-hover:text-gold">
              <span className="tabular text-xs text-ink-muted">{i + 1}</span>
              {tag.name}
            </span>
            <span className="vault-dots" />
            <span className={`font-display tabular shrink-0 text-sm font-medium ${i === 0 ? "text-gold" : "text-ink"}`}>
              {formatCurrency(tag.total)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
