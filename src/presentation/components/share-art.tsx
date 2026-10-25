"use client";

import { useState } from "react";

type Props = { slug: string; title: string; path: string };

const FORMATS = [
  { id: "stories", label: "arte stories" },
  { id: "feed", label: "arte feed" },
] as const;

type Status = { format: (typeof FORMATS)[number]["id"]; text: string } | null;

/**
 * Arte pronta para as redes. No celular abre a folha de compartilhamento com a
 * imagem (Instagram, WhatsApp…); onde não dá, baixa o PNG. O link do registro
 * vai para a área de transferência — para colar no sticker de link do stories.
 */
export function ShareArt({ slug, title, path }: Props) {
  const [status, setStatus] = useState<Status>(null);

  async function share(format: (typeof FORMATS)[number]["id"]) {
    const url = new URL(path, window.location.origin).toString();
    setStatus({ format, text: "preparando…" });

    try {
      const response = await fetch(`${path}/arte/${format}`);
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      const file = new File([blob], `noise-${slug}-${format}.png`, { type: "image/png" });

      const copied = await navigator.clipboard?.writeText(url).then(
        () => true,
        () => false,
      );

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text: url });
        setStatus({ format, text: copied ? "link copiado" : "" });
      } else {
        const href = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement("a"), { href, download: file.name });
        link.click();
        URL.revokeObjectURL(href);
        setStatus({ format, text: copied ? "baixada · link copiado" : "baixada" });
      }
    } catch (error) {
      // Fechar a folha de compartilhamento não é erro.
      setStatus((error as DOMException)?.name === "AbortError" ? null : { format, text: "não deu agora" });
    }
  }

  return (
    <ul className="space-y-2 font-mono text-xs lowercase text-muted">
      {FORMATS.map(({ id, label }) => (
        <li key={id}>
          <button
            type="button"
            onClick={() => share(id)}
            className="group/art cursor-pointer text-left transition-colors hover:text-ink"
          >
            <span className="transition-colors group-hover/art:text-signal">↓</span> {label}
          </button>
          {status?.format === id && status.text && (
            <span aria-live="polite" className="mt-1 block opacity-60">
              {status.text}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
