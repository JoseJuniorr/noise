/** Categorias de conteúdo — espelham o enum `category` da API (OpenAPI v1). */
export const CATEGORIES = ["engineering", "music", "projects"] as const;

export type Category = (typeof CATEGORIES)[number];
