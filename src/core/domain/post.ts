/**
 * Registro do fluxo, no formato que a UI consome — o mesmo venha ele de
 * arquivos Markdown (fase 1) ou do Strapi (fase 2).
 */

/**
 * Como a imagem aparece no site. "submersa" é o tratamento da casa (P&B,
 * fundida à névoa); os demais mostram a foto como ela é, com um filtro.
 */
export const IMAGE_FILTERS = ["submersa", "natural", "preto_e_branco", "sepia", "alto_contraste", "vinheta"] as const;
/** Recorte da imagem; "original" mantém a proporção do arquivo. */
export const IMAGE_RATIOS = ["original", "quadrado", "retrato", "paisagem", "panoramico"] as const;
/** Onde o recorte se ancora quando corta a imagem. */
export const IMAGE_FOCI = ["automatico", "rosto", "centro", "topo", "base"] as const;

export type ImageTreatment = {
  filter: (typeof IMAGE_FILTERS)[number];
  ratio: (typeof IMAGE_RATIOS)[number];
  focus: (typeof IMAGE_FOCI)[number];
};

export const DEFAULT_TREATMENT: ImageTreatment = { filter: "submersa", ratio: "original", focus: "automatico" };

/**
 * Imagem no provedor (Cloudinary): o domínio guarda só o id público, nunca uma
 * URL, e o tratamento em termos do site — quem traduz para o provedor é a infraestrutura.
 * `alt` vazio = imagem decorativa.
 */
export type ImageRef = { publicId: string; alt: string; treatment?: ImageTreatment };

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
  /** Imagem do registro, em qualquer forma; na forma "photo" ela é o próprio registro. */
  image?: ImageRef;
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
