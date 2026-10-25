"use client";

/**
 * Estado do "passei por aqui" no navegador, compartilhado entre a contagem na
 * margem e o convite no fim do texto: quando uma muda, a outra acompanha.
 */
export type PassageSnapshot = { count: number; names: string[]; marked: boolean; myName?: string };

const listeners = new Set<() => void>();
const live = new Map<string, Omit<PassageSnapshot, "marked">>();
const snapshots = new Map<string, PassageSnapshot>();

const markedKey = (slug: string) => `noise:passei:${slug}`;
const nameKey = (slug: string) => `noise:passei:${slug}:nome`;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // aba privada ou storage bloqueado: vale só a visita
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * Leitura estável (mesmo objeto enquanto nada muda), como o React exige.
 * `initial` é o que o servidor contou; depois de uma marca, vale o que a API devolveu.
 */
export function getSnapshot(slug: string, initial: { count: number; names: string[] }): PassageSnapshot {
  const base = live.get(slug) ?? initial;
  const marked = readStorage(markedKey(slug)) === "1";
  const myName = readStorage(nameKey(slug)) ?? undefined;
  const previous = snapshots.get(slug);
  if (
    previous &&
    previous.count === base.count &&
    previous.names === base.names &&
    previous.marked === marked &&
    previous.myName === myName
  ) {
    return previous;
  }
  const next = { ...base, marked, myName };
  snapshots.set(slug, next);
  return next;
}

export function recordPassage(slug: string, result: { count: number; names: string[] }, name?: string) {
  live.set(slug, result);
  try {
    localStorage.setItem(markedKey(slug), "1");
    if (name) localStorage.setItem(nameKey(slug), name);
  } catch {
    // sem storage, a marca vale só para esta visita
  }
  for (const listener of listeners) listener();
}
