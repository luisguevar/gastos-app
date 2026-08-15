import {
  IconLayoutDashboard,
  IconReceipt2,
  IconWallet,
  type TablerIcon,
} from "@tabler/icons-react";

export type NavLink = {
  href: string;
  label: string;
  icon: TablerIcon;
};

/** Enlaces principales del menú, compartidos entre sidebar (web), barra
 * inferior (móvil) y drawer (móvil). */
export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/consumos", label: "Consumos", icon: IconReceipt2 },
  { href: "/presupuestos", label: "Presupuestos", icon: IconWallet },
];

/** Subconjunto para la barra inferior de móvil. */
export const MOBILE_BOTTOM_LINKS: NavLink[] = NAV_LINKS.slice(0, 2);
