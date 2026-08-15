"use client";

import { useState } from "react";
import { useConsumosNav } from "@/components/consumos/consumos-nav";
import { IconPlus } from "@tabler/icons-react";
import { Modal } from "@/components/modal";
import { ExpenseForm } from "@/components/expense-form";
import { LoanForm } from "@/components/loan-form";
import { ConsumosExport } from "@/components/consumos/consumos-export";
import type { ExpenseFilters } from "@/lib/queries";
import type { Category, PaymentAccount, PaymentType, Person, Tag } from "@/lib/types";

export function ConsumosHeaderActions({
  categories,
  paymentTypes,
  paymentAccounts,
  tags,
  people,
  exportFilters,
}: {
  categories: Category[];
  paymentTypes: PaymentType[];
  paymentAccounts: PaymentAccount[];
  tags: Tag[];
  people: Person[];
  exportFilters: ExpenseFilters;
}) {
  const { refresh } = useConsumosNav();
  const [openGasto, setOpenGasto] = useState(false);
  const [openPrestamo, setOpenPrestamo] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <ConsumosExport filters={exportFilters} />

      <button
        type="button"
        onClick={() => setOpenPrestamo(true)}
        className="inline-flex items-center gap-1.5 rounded-[10px] border border-gold bg-transparent px-3.5 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
      >
        <IconPlus size={16} /> Préstamo
      </button>
      <button
        type="button"
        onClick={() => setOpenGasto(true)}
        className="inline-flex items-center gap-1.5 rounded-[10px] bg-gold px-3.5 py-2 text-sm font-semibold text-gold-ink transition-colors hover:bg-gold-hover"
      >
        <IconPlus size={16} /> Gasto
      </button>

      <Modal open={openGasto} onClose={() => setOpenGasto(false)} title="Nuevo gasto">
        <ExpenseForm
          mode="create"
          categories={categories}
          paymentTypes={paymentTypes}
          paymentAccounts={paymentAccounts}
          tags={tags}
          onSuccess={() => {
            setOpenGasto(false);
            refresh();
          }}
        />
      </Modal>

      <Modal open={openPrestamo} onClose={() => setOpenPrestamo(false)} title="Nuevo préstamo">
        <LoanForm
          mode="create"
          categories={categories}
          paymentTypes={paymentTypes}
          paymentAccounts={paymentAccounts}
          tags={tags}
          people={people}
          onSuccess={() => {
            setOpenPrestamo(false);
            refresh();
          }}
        />
      </Modal>
    </div>
  );
}
