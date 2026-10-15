/**
 * Registro do fluxo, no formato que a UI consome — o mesmo venha ele de
 * arquivos Markdown (fase 1) ou do Strapi (fase 2).
 */

/** Imagem no provedor (Cloudinary): o domínio guarda só o id público, nunca uma URL. */
export type ImageRef = { publicId: string; alt: string };

type PostBase = {
  slug: string;
  /** Hora local sem fuso: "AAAA-MM-DD" ou "AAAA-MM-DDTHH:MM". A hora é parte do registro. */
  publishedAt: string;
  title?: string;
  /**
   * Corpo já renderizado em HTML pelo adaptador. A UI não sabe — nem deve
   * saber — se ele nasceu de Markdown, de blocos do Strapi ou de outra coisa.
   */
  html: string;
};

/**
 * O `kind` muda só a forma de mostrar o registro; nunca vira categoria ou rótulo.
 * Em "code", o trecho de código vem dentro do próprio `html` (um <pre>).
 */
export type Post = PostBase &
  (
    | { kind: "text" }
    | { kind: "code" }
    | { kind: "chord"; chord: { name: string; shape?: string } }
    | { kind: "photo"; image: ImageRef }
  );

export type PostKind = Post["kind"];

export const POST_KINDS = ["text", "code", "chord", "photo"] as const satisfies readonly PostKind[];

export class InvalidPostError extends Error {
  constructor(slug: string, reason: string) {
    super(`Registro "${slug}" inválido: ${reason}`);
    this.name = "InvalidPostError";
  }
}

/** Ordem do fluxo: do mais recente para o mais antigo (ISO local ordena como texto). */
export function byNewestFirst(a: Post, b: Post): number {
  return b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug);
}
