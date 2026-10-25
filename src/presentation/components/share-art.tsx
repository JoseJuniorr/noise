"use client";

import { useRef, useState, useSyncExternalStore } from "react";

type Props = { slug: string; title: string; path: string };

const FORMATS = [
  { id: "stories", label: "arte stories" },
  { id: "feed", label: "arte feed" },
] as const;

type FormatId = (typeof FORMATS)[number]["id"];
type SendState = "idle" | "preparing" | "ready" | "failed";

const noop = () => () => {};
let filesSupport: boolean | undefined;
// Enviar imagem pela folha do sistema só existe em alguns aparelhos (celulares, sobretudo).
const canShareFiles = () =>
  (filesSupport ??=
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [new File([""], "noise.png", { type: "image/png" })] }));

/**
 * Arte pronta para as redes: "baixar" salva o PNG direto; "enviar" abre a folha
 * do sistema com a imagem. A arte leva alguns segundos para ficar pronta e o
 * navegador só abre a folha logo após um toque — se esse prazo passar, o botão
 * pede um segundo toque, já com a arte na mão.
 */
export function ShareArt({ slug, title, path }: Props) {
  const hasFileShare = useSyncExternalStore(noop, canShareFiles, () => false);
  const [send, setSend] = useState<Partial<Record<FormatId, SendState>>>({});
  const files = useRef(new Map<FormatId, File>());

  const artUrl = (format: FormatId) => `${path}/arte/${format}`;
  const fileName = (format: FormatId) => `noise-${slug}-${format}.png`;

  async function onSend(format: FormatId) {
    const ready = files.current.get(format);
    if (ready) return shareFile(format, ready);

    setSend((s) => ({ ...s, [format]: "preparing" }));
    try {
      const response = await fetch(artUrl(format));
      if (!response.ok) throw new Error(String(response.status));
      const file = new File([await response.blob()], fileName(format), { type: "image/png" });
      files.current.set(format, file);
      await shareFile(format, file);
    } catch {
      setSend((s) => ({ ...s, [format]: "failed" }));
    }
  }

  async function shareFile(format: FormatId, file: File) {
    try {
      await navigator.share({ files: [file], title });
      setSend((s) => ({ ...s, [format]: "idle" }));
    } catch (error) {
      const name = (error as DOMException)?.name;
      // O prazo do toque passou enquanto a arte era gerada: pede um novo toque.
      if (name === "NotAllowedError") setSend((s) => ({ ...s, [format]: "ready" }));
      else setSend((s) => ({ ...s, [format]: name === "AbortError" ? "idle" : "failed" }));
    }
  }

  const button = "group/art cursor-pointer text-left transition-colors hover:text-ink";
  const mark = "transition-colors group-hover/art:text-signal";
  const sendLabel: Record<SendState, string> = {
    idle: "enviar",
    preparing: "preparando…",
    ready: "pronta · toque para enviar",
    failed: "não deu · tentar de novo",
  };

  return (
    <ul className="space-y-3 font-mono text-xs lowercase text-muted">
      {FORMATS.map(({ id, label }) => (
        <li key={id}>
          <span className="block opacity-70">{label}</span>
          <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <a href={artUrl(id)} download={fileName(id)} className={button}>
              <span className={mark}>↓</span> baixar
            </a>
            {hasFileShare && (
              <button
                type="button"
                onClick={() => onSend(id)}
                disabled={send[id] === "preparing"}
                aria-live="polite"
                className={`${button} disabled:cursor-wait disabled:opacity-60`}
              >
                <span className={mark}>↗</span> {sendLabel[send[id] ?? "idle"]}
              </button>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
