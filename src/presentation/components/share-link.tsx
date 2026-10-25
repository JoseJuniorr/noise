"use client";

import { useState, useSyncExternalStore } from "react";
import { copyText } from "./clipboard";

type Props = { title: string; path: string };

const noop = () => () => {};
// Folha de compartilhamento do sistema: existe no celular e em alguns desktops.
const canShareLinks = () => typeof navigator.share === "function";

/** Compartilhar o link do registro e copiá-lo — com retorno honesto sobre a cópia. */
export function ShareLink({ title, path }: Props) {
  const hasShareSheet = useSyncExternalStore(noop, canShareLinks, () => false);
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const url = () => new URL(path, window.location.origin).toString();

  async function onCopy() {
    // Nada de await antes da cópia: o navegador só a permite logo após o toque.
    const ok = await copyText(url());
    setCopy(ok ? "copied" : "failed");
    if (ok) setTimeout(() => setCopy("idle"), 2500);
  }

  async function onShare() {
    try {
      await navigator.share({ title, url: url() });
    } catch {
      // Fechar a folha não é erro; se o sistema recusar, ainda há "copiar link".
    }
  }

  const button = "group/share cursor-pointer text-left transition-colors hover:text-ink";
  const mark = "transition-colors group-hover/share:text-signal";

  return (
    <div className="space-y-2 font-mono text-xs lowercase text-muted">
      {hasShareSheet && (
        <button type="button" onClick={onShare} className={`block ${button}`}>
          <span className={mark}>↗</span> compartilhar
        </button>
      )}
      <button type="button" onClick={onCopy} className={`block ${button}`}>
        <span className={mark}>⧉</span> copiar link
      </button>
      <p aria-live="polite" className="opacity-60">
        {copy === "copied" && "link copiado"}
        {copy === "failed" && (
          // Sem permissão de cópia: o endereço fica à mão para copiar manualmente.
          <span className="block normal-case select-all break-all">{url()}</span>
        )}
      </p>
    </div>
  );
}
