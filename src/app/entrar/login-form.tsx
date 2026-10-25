"use client";

import { useActionState, useSyncExternalStore } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  // O destino depois do login vem da URL (?next=/registros/…), lido só no navegador.
  const next = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("next") ?? "/",
    () => "/",
  );

  return (
    <form action={action} className="max-w-xs space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block font-mono text-xs lowercase tracking-[0.14em] text-muted" htmlFor="password">
        senha
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="w-full border-b border-line bg-transparent py-2 text-lg text-ink outline-none transition-colors focus:border-signal"
      />
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer font-mono text-xs lowercase tracking-[0.14em] text-muted transition-colors hover:text-ink disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "entrando…" : "entrar →"}
      </button>
      {state.error && (
        <p role="alert" className="font-mono text-xs lowercase text-signal">
          {state.error}
        </p>
      )}
    </form>
  );
}
