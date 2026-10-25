"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { joinNames } from "@/core/domain/passage";
import { passageLabel } from "@/presentation/format/passages";
import { getSnapshot, recordPassage, subscribe, type PassageSnapshot } from "./passage-store";

type Props = { slug: string; initialCount: number; initialNames: string[] };

/**
 * No fim do texto, o momento natural depois da leitura: deixar uma marca,
 * com o nome se a pessoa quiser. Depois, o agradecimento no lugar do convite.
 */
export function PassageForm({ slug, initialCount, initialNames }: Props) {
  const initial = { count: initialCount, names: initialNames };
  // Retrato do servidor: o mesmo objeto em toda leitura, como a hidratação exige.
  const [serverSnapshot] = useState<PassageSnapshot>(() => ({ ...initial, marked: false }));
  const state = useSyncExternalStore(subscribe, () => getSnapshot(slug, initial), () => serverSnapshot);
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();

  async function leave(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/passagens/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined }),
      });
      const data = (await response.json()) as { count?: number; names?: string[]; error?: string };
      if (!response.ok || data.count === undefined) throw new Error(data.error ?? "não deu agora, tente de novo.");
      recordPassage(slug, { count: data.count, names: data.names ?? [] }, name.trim() || undefined);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (state.marked) {
    return (
      <section id="passei" aria-live="polite" className="mt-16 border-t border-line pt-8">
        <p className="text-lg italic text-ink/90">
          <span className="not-italic text-signal">◼</span> obrigado por passar{state.myName ? `, ${state.myName}` : ""}.
        </p>
        <p className="mt-2 font-mono text-xs lowercase text-muted">
          {passageLabel(state.count)}
          {state.names.length > 0 && <span className="normal-case"> — entre eles {joinNames(state.names)}</span>}
        </p>
      </section>
    );
  }

  return (
    <section id="passei" aria-labelledby="passei-titulo" className="mt-16 border-t border-line pt-8">
      <h2 id="passei-titulo" className="text-lg italic text-ink/90">
        Leu até aqui? Deixe uma marca.
      </h2>
      <form onSubmit={leave} className="mt-5 flex max-w-md flex-wrap items-baseline gap-x-5 gap-y-3">
        <label htmlFor="passei-nome" className="sr-only">
          Seu nome (opcional, fica visível)
        </label>
        <input
          id="passei-nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={32}
          autoComplete="given-name"
          placeholder="seu nome, se quiser"
          className="min-w-0 flex-1 border-b border-line bg-transparent py-1 text-base text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-signal"
        />
        <button
          type="submit"
          disabled={sending}
          className="group/mark cursor-pointer font-mono text-xs lowercase text-muted transition-colors hover:text-ink disabled:cursor-wait disabled:opacity-60"
        >
          <span className="transition-colors group-hover/mark:text-signal">◼</span> {sending ? "deixando…" : "passei por aqui"}
        </button>
      </form>
      <p className="mt-3 font-mono text-[0.65rem] lowercase text-muted/70">
        {error ?? (state.count > 0 ? `${passageLabel(state.count)}. o nome fica visível; sem nome, a marca é anônima.` : "o nome fica visível; sem nome, a marca é anônima.")}
      </p>
    </section>
  );
}
