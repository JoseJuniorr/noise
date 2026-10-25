"use client";

import { useState, useSyncExternalStore } from "react";
import { joinNames } from "@/core/domain/passage";
import { passageLabel } from "@/presentation/format/passages";
import { getSnapshot, subscribe, type PassageSnapshot } from "./passage-store";

type Props = { slug: string; initialCount: number; initialNames: string[] };

/**
 * Na margem, sob a data: quantos passaram, os nomes mais recentes e — para
 * quem ainda não passou — um atalho até o convite no fim do texto.
 */
export function PassageSummary({ slug, initialCount, initialNames }: Props) {
  const initial = { count: initialCount, names: initialNames };
  // Retrato do servidor: o mesmo objeto em toda leitura, como a hidratação exige.
  const [serverSnapshot] = useState<PassageSnapshot>(() => ({ ...initial, marked: false }));
  const state = useSyncExternalStore(subscribe, () => getSnapshot(slug, initial), () => serverSnapshot);

  return (
    <div aria-live="polite" className="font-mono text-xs lowercase text-muted">
      {state.count > 0 && (
        <p>
          <span className={state.marked ? "text-signal" : "text-muted"}>◼</span> {passageLabel(state.count)}
          {state.names.length > 0 && (
            <span className="mt-1 block normal-case opacity-70">entre eles {joinNames(state.names)}</span>
          )}
        </p>
      )}
      {!state.marked && (
        <a href="#passei" className="mt-1 block transition-colors hover:text-ink">
          {state.count === 0 && <span className="text-muted">◼ </span>}deixar marca ↓
        </a>
      )}
    </div>
  );
}
