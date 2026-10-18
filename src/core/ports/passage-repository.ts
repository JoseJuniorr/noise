/**
 * "Passei por aqui": marcas que visitantes deixam em um registro.
 * Guarda só a contagem por registro — nada sobre quem passou.
 */
export interface PassageRepository {
  /** Contagem de cada slug pedido; slugs sem marca ficam de fora (= 0). */
  counts(slugs: readonly string[]): Promise<Record<string, number>>;
  /** Deixa uma marca e devolve a nova contagem do registro. */
  add(slug: string): Promise<number>;
}
