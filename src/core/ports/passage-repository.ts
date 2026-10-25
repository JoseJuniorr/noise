/**
 * "Passei por aqui": marcas que visitantes deixam em um registro.
 * Guarda a contagem por registro e, quando a pessoa quiser, o nome dela.
 */
export interface PassageRepository {
  /** Contagem de cada slug pedido; slugs sem marca ficam de fora (= 0). */
  counts(slugs: readonly string[]): Promise<Record<string, number>>;
  /** Deixa uma marca (com nome, se houver) e devolve a nova contagem do registro. */
  add(slug: string, name?: string): Promise<number>;
  /** Os nomes mais recentes deixados num registro, do mais novo ao mais antigo. */
  recentNames(slug: string, limit: number): Promise<string[]>;
}
