/**
 * Loader de marca. Anillo con arco dorado (verde de acento) girando, sobre
 * tokens de tema. Reutilizable en cualquier estado de carga.
 */
export function Loader({
  label = "Cargando…",
  size = "md",
  className = "",
}: {
  label?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const ring =
    size === "sm"
      ? "h-5 w-5 border-2"
      : size === "lg"
        ? "h-10 w-10 border-[3px]"
        : "h-8 w-8 border-2";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <span className={`${ring} animate-spin rounded-full border-line border-t-gold`} aria-hidden />
      {label ? (
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">{label}</span>
      ) : null}
      <span className="sr-only">Cargando</span>
    </div>
  );
}

/** Variante que ocupa el área de contenido, centrada verticalmente. */
export function PageLoader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <Loader label={label} size="lg" />
    </div>
  );
}

/** Spinner en línea (arco en color de texto actual) para botones/acciones. */
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`${className} inline-block animate-spin rounded-full border-2 border-transparent border-t-current align-[-2px]`}
    />
  );
}
