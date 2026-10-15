import type { Post } from "@/core/domain/post";

/**
 * Porta de leitura dos registros. Cada fonte de conteúdo é um adaptador que
 * implementa esta interface: hoje Markdown local, amanhã Strapi. Nada acima
 * dela (casos de uso, páginas, componentes) muda quando a fonte muda.
 *
 * Adaptadores não precisam ordenar: a ordem do fluxo é regra do caso de uso.
 */
export interface PostRepository {
  findAll(): Promise<Post[]>;
  /** `null` quando não existe — "não encontrado" não é erro. */
  findBySlug(slug: string): Promise<Post | null>;
}
