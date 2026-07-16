"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLayoutDashboard, IconReceipt2 } from "@tabler/icons-react";
import { UserMenu } from "@/components/nav/user-menu";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/gastos", label: "Gastos", icon: IconReceipt2 },
] as const;

export function DesktopNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="hidden border-b border-line md:block">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <span className="text-[14px] font-medium tracking-[0.08em] text-ink">BÓVEDA</span>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-[8px] px-3 py-[7px] text-[13px] transition-colors ${
                    active ? "bg-card text-ink" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <Icon size={16} className={active ? "text-gold" : "text-ink-muted"} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <UserMenu email={email} variant="desktop" />
      </div>
    </header>
  );
}
