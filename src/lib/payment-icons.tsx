import {
  IconCash,
  IconCreditCard,
  IconDeviceMobile,
  IconTransfer,
  type TablerIcon,
} from "@tabler/icons-react";

/** Nombres de payment_types que requieren elegir una cuenta/tarjeta asociada. */
const REQUIRES_ACCOUNT = new Set(["transferencia", "tarjeta débito", "tarjeta crédito"]);

export function paymentTypeRequiresAccount(name: string): boolean {
  return REQUIRES_ACCOUNT.has(name.trim().toLowerCase());
}

/** Ícono según el nombre del tipo de pago. Matchea por nombre (no por id)
 * porque payment_types es una tabla editable por el usuario — si renombran
 * "Efectivo" a otra cosa, cae al ícono genérico de tarjeta. */
export function iconForPaymentType(name: string): TablerIcon {
  const normalized = name.trim().toLowerCase();
  if (normalized === "efectivo") return IconCash;
  if (normalized === "yape" || normalized === "plin") return IconDeviceMobile;
  if (normalized === "transferencia") return IconTransfer;
  return IconCreditCard;
}
