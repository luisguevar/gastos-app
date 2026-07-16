"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconLayoutDashboard, IconPlus, IconReceipt2 } from "@tabler/icons-react";
import { UserMenu } from "@/components/nav/user-menu";
import { Modal } from "@/components/modal";
import { ExpenseForm } from "@/components/expense-form";
import type { Category, PaymentAccount, PaymentType, Tag } from "@/lib/types";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/gastos", label: "Gastos", icon: IconReceipt2 },
] as const;

export function MobileNav({
  email,
  categories,
  paymentTypes,
  paymentAccounts,
  tags,
}: {
  email: string;
  categories: Category[];
  paymentTypes: PaymentType[];
  paymentAccounts: PaymentAccount[];
  tags: Tag[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [dashboardLink, gastosLink] = LINKS;

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function NavItem({ href, label, icon: Icon }: (typeof LINKS)[number]) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
      >
        <Icon size={20} className={active ? "text-gold" : "text-ink-muted"} />
        <span className={`text-[10px] ${active ? "text-ink" : "text-ink-muted"}`}>{label}</span>
      </Link>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
        <span className="text-[14px] font-medium tracking-[0.08em] text-ink">BÓVEDA</span>
        <UserMenu email={email} variant="mobile" />
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg px-1 pt-2 md:hidden"
        style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex w-full items-center">
          <NavItem {...dashboardLink} />
          <NavItem {...gastosLink} />
        </div>

        <button
          type="button"
          onClick={() => setQuickAddOpen(true)}
          aria-label="Agregar gasto"
          className="flex h-11 w-11 items-center justify-center rounded-full border-[4px] border-bg bg-gold"
          style={{
            position: "absolute",
            left: "50%",
            top: "-22px",
            transform: "translateX(-50%)",
          }}
        >
          <IconPlus size={20} className="text-[#412402]" />
        </button>
      </nav>

      <Modal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        title="Nuevo gasto"
      >
        <ExpenseForm
          mode="create"
          categories={categories}
          paymentTypes={paymentTypes}
          paymentAccounts={paymentAccounts}
          tags={tags}
          onSuccess={() => {
            setQuickAddOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}
