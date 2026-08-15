"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconMenu2, IconPlus, IconX } from "@tabler/icons-react";
import { Modal } from "@/components/modal";
import { ExpenseForm } from "@/components/expense-form";
import { UserMenu } from "@/components/nav/user-menu";
import { NAV_LINKS, MOBILE_BOTTOM_LINKS, type NavLink } from "@/components/nav/links";
import type { Category, PaymentAccount, PaymentType, Tag } from "@/lib/types";

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
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // Cierra el drawer al cambiar de ruta y con la tecla Escape.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const drawerItemBase =
    "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition-colors";

  function BottomItem({ href, label, icon: Icon }: NavLink) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
      >
        <Icon size={20} className={active ? "text-gold" : "text-ink-muted"} />
        <span className={`text-[10px] ${active ? "text-ink" : "text-ink-muted"}`}>
          {label}
        </span>
      </Link>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-muted transition-colors hover:text-ink"
          >
            <IconMenu2 size={20} />
          </button>
          <span className="text-[14px] font-medium tracking-[0.08em] text-ink">
            BÓVEDA
          </span>
        </div>

        <UserMenu email={email} variant="mobile" />
      </header>

      {/* Drawer lateral (móvil): solo navegación entre secciones. La cuenta
          (Configuración / Salir) vive en el menú del avatar de arriba. */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.55)]"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 max-w-[80%] flex-col border-r border-line bg-bg px-3 py-5">
            <div className="flex items-center justify-between px-3 pb-6">
              <span className="text-[14px] font-medium tracking-[0.18em] text-ink">
                BÓVEDA
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-muted transition-colors hover:text-ink"
              >
                <IconX size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`${drawerItemBase} ${
                      active
                        ? "bg-card text-ink"
                        : "text-ink-muted hover:bg-card/60 hover:text-ink"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-gold" : "text-ink-muted"}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}

      {/* Barra inferior (móvil). */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg px-1 pt-2 md:hidden"
        style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex w-full items-center">
          {MOBILE_BOTTOM_LINKS.map((link) => (
            <BottomItem key={link.href} {...link} />
          ))}
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
          <IconPlus size={20} className="text-gold-ink" />
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
