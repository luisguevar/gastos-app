"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[10px] bg-gold py-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-ink transition-colors hover:bg-gold-hover disabled:opacity-50"
    >
      {pending ? "Ingresando…" : "Ingresar"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Correo
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-[8px] border border-line bg-card px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-gold"
          placeholder="tu@correo.com"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Contraseña
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-[8px] border border-line bg-card px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-gold"
          placeholder="••••••••"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-danger-ink" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
