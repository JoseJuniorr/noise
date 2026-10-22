"use client";

import { useState } from "react";

type Props = { title: string; path: string };

/**
 * Compartilhar um registro. No celular abre a folha do sistema (WhatsApp,
 * Instagram…); onde ela não existe, copia o link.
 */
export function ShareLink({ title, path }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch (error) {
      // Fechar a folha de compartilhamento não é erro.
      if ((error as DOMException)?.name !== "AbortError") setState("failed");
    }
  }

  return (
    <p className="font-mono text-xs lowercase text-muted">
      <button
        type="button"
        onClick={share}
        className="group/share cursor-pointer text-left transition-colors hover:text-ink"
      >
        <span className="transition-colors group-hover/share:text-signal">↗</span> compartilhar
      </button>
      <span aria-live="polite" className="mt-1 block opacity-60">
        {state === "copied" && "link copiado"}
        {state === "failed" && "não deu para copiar"}
      </span>
    </p>
  );
}
