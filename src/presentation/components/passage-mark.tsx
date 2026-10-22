"use client";

import { useState, useSyncExternalStore } from "react";
import { passageLabel } from "@/presentation/format/passages";

const storageKey = (slug: string) => `noise:passei:${slug}`;

// O navegador lembra quem já passou; sem storage (aba privada), o gesto vale para a visita.
function readMarked(slug: string): boolean {
  try {
    return localStorage.getItem(storageKey(slug)) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

type Props = { slug: string; initialCount: number };

/**
 * "Passei por aqui": um gesto, não uma estatística. Quem quiser deixa a marca,
 * uma vez por registro; depois disso a contagem aparece no lugar do convite.
 */
export function PassageMark({ slug, initialCount }: Props) {
  const remembered = useSyncExternalStore(subscribe, () => readMarked(slug), () => false);
  const [count, setCount] = useState(initialCount);
  const [leftNow, setLeftNow] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "failed">("idle");
  const marked = remembered || leftNow;

  async function leave() {
    setState("sending");
    try {
      const response = await fetch(`/api/passagens/${encodeURIComponent(slug)}`, { method: "POST" });
      if (!response.ok) throw new Error(String(response.status));
      const { count: next } = (await response.json()) as { count: number };
      setCount(next);
      setLeftNow(true);
      setState("idle");
      try {
        localStorage.setItem(storageKey(slug), "1");
      } catch {
        // Sem storage, a marca vale só para esta visita.
      }
    } catch {
      setState("failed");
    }
  }

  if (marked) {
    return (
      <p aria-live="polite" className="font-mono text-xs lowercase text-muted">
        <span className="not-italic text-signal">◼</span> {passageLabel(Math.max(count, 1))}
      </p>
    );
  }

  return (
    <p className="font-mono text-xs lowercase text-muted">
      <button
        type="button"
        onClick={leave}
        disabled={state === "sending"}
        className="group/mark cursor-pointer text-left transition-colors hover:text-ink disabled:cursor-wait disabled:opacity-60"
      >
        <span className="text-muted transition-colors group-hover/mark:text-signal">◼</span> passei por aqui
      </button>
      {count > 0 && <span className="mt-1 block opacity-60">{passageLabel(count)}</span>}
      {state === "failed" && <span className="ml-3 normal-case opacity-80">não deu agora, tente de novo.</span>}
    </p>
  );
}
