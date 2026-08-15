import { IconWallet } from "@tabler/icons-react";

export default function PresupuestosPage() {
  return (
    <>
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Bóveda</p>
        <h1 className="font-display text-xl font-semibold text-ink">Presupuestos</h1>
      </header>

      <section className="vault-card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <IconWallet size={32} className="text-gold" />
        <p className="text-sm font-medium text-ink">Próximamente</p>
        <p className="max-w-xs text-xs leading-relaxed text-ink-muted">
          Aquí podrás fijar un límite de gasto por categoría o período y ver
          cuánto llevas consumido frente a lo presupuestado.
        </p>
      </section>
    </>
  );
}
