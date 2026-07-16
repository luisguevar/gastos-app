import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="vault-card w-full max-w-sm px-8 py-10">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">
            Bóveda
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-ink">
            Iniciar sesión
          </h1>
          <div className="mx-auto mt-4 w-16 border-t border-line" />
        </header>

        <LoginForm />

        <p className="mt-8 text-center text-[11px] leading-relaxed text-ink-muted">
          Acceso restringido. Si no tienes cuenta, pide al administrador que
          la cree desde el panel de Supabase.
        </p>
      </div>
    </main>
  );
}
