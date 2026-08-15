"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLogout, IconSettings } from "@tabler/icons-react";
import { signOut } from "@/app/actions/auth";
import { NAV_LINKS } from "@/components/nav/links";
import { ThemeToggle } from "@/components/nav/theme-toggle";

const itemBase =
  "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] transition-colors";

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const initial = (email.trim().charAt(0) || "?").toUpperCase();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-bg md:flex">
      <div className="flex h-full flex-col px-3 py-5">
        <div className="px-3 pb-6">
          <span className="text-[14px] font-medium tracking-[0.18em] text-ink">
            BÓVEDA
          </span>
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
                className={`${itemBase} ${
                  active
                    ? "bg-card text-ink"
                    : "text-ink-muted hover:bg-card/60 hover:text-ink"
                }`}
              >
                <Icon size={18} className={active ? "text-gold" : "text-ink-muted"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3">
          <Link
            href="/configuracion"
            aria-current={isActive("/configuracion") ? "page" : undefined}
            className={`${itemBase} ${
              isActive("/configuracion")
                ? "bg-card text-ink"
                : "text-ink-muted hover:bg-card/60 hover:text-ink"
            }`}
          >
            <IconSettings
              size={18}
              className={isActive("/configuracion") ? "text-gold" : "text-ink-muted"}
            />
            Configuración
          </Link>

          <ThemeToggle
            className={`${itemBase} w-full text-ink-muted hover:bg-card/60 hover:text-ink`}
            iconSize={18}
          />

          <div className="mt-2 flex items-center gap-2.5 px-3 py-2">
            <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-gold text-xs font-semibold text-gold-ink">
              {initial}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] text-ink-muted">
              {email}
            </span>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className={`${itemBase} w-full text-ink-muted hover:bg-card/60 hover:text-danger-ink`}
            >
              <IconLogout size={18} />
              Salir
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
