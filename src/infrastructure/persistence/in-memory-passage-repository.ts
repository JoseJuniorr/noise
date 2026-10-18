import type { PassageRepository } from "@/core/ports/passage-repository";

// O Next empacota rotas de API e páginas separadamente, cada uma com sua cópia
// deste módulo; o Map fica no processo para as duas enxergarem as mesmas marcas.
const shared = globalThis as typeof globalThis & { __noisePassages?: Map<string, number> };

/** Para desenvolvimento e testes: as marcas somem quando o processo reinicia. */
export class InMemoryPassageRepository implements PassageRepository {
  constructor(private readonly store: Map<string, number> = (shared.__noisePassages ??= new Map())) {}

  async counts(slugs: readonly string[]): Promise<Record<string, number>> {
    return Object.fromEntries(
      slugs.filter((slug) => this.store.has(slug)).map((slug) => [slug, this.store.get(slug)!]),
    );
  }

  async add(slug: string): Promise<number> {
    const next = (this.store.get(slug) ?? 0) + 1;
    this.store.set(slug, next);
    return next;
  }
}
