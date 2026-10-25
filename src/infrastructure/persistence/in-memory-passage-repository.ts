import type { PassageRepository } from "@/core/ports/passage-repository";

type Store = { counts: Map<string, number>; names: Map<string, string[]> };

// O Next empacota rotas de API e páginas separadamente, cada uma com sua cópia
// deste módulo; o estado fica no processo para as duas enxergarem as mesmas marcas.
const shared = globalThis as typeof globalThis & { __noisePassages?: Store };

/** Para desenvolvimento e testes: as marcas somem quando o processo reinicia. */
export class InMemoryPassageRepository implements PassageRepository {
  constructor(private readonly store: Store = (shared.__noisePassages ??= { counts: new Map(), names: new Map() })) {}

  async counts(slugs: readonly string[]): Promise<Record<string, number>> {
    return Object.fromEntries(
      slugs.filter((slug) => this.store.counts.has(slug)).map((slug) => [slug, this.store.counts.get(slug)!]),
    );
  }

  async add(slug: string, name?: string): Promise<number> {
    const next = (this.store.counts.get(slug) ?? 0) + 1;
    this.store.counts.set(slug, next);
    if (name) this.store.names.set(slug, [name, ...(this.store.names.get(slug) ?? [])]);
    return next;
  }

  async recentNames(slug: string, limit: number): Promise<string[]> {
    return (this.store.names.get(slug) ?? []).slice(0, limit);
  }
}

export const emptyPassageStore = (): Store => ({ counts: new Map(), names: new Map() });
