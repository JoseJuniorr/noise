import type { Post } from "@/core/domain/post";

/** Minúsculas e sem acentos: "Canção" e "cancao" são a mesma busca. */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, " ");

export type SearchQuery = { text?: string; tag?: string };

/**
 * Busca no fluxo. Todas as palavras digitadas precisam aparecer em algum lugar
 * do registro; título, tags e palavras-chave pesam mais que o corpo do texto.
 * Com `tag`, só registros com aquela tag. Sem nada, devolve o fluxo inteiro.
 * Pura e em memória: um caderno pessoal cabe inteiro na memória.
 */
export function searchPosts(posts: readonly Post[], { text = "", tag }: SearchQuery): Post[] {
  const words = normalize(text).split(/\s+/).filter(Boolean);
  const tagSlug = tag && normalize(tag);

  const scored = posts.flatMap((post) => {
    if (tagSlug && !post.tags.some((t) => normalize(t.slug) === tagSlug)) return [];
    if (words.length === 0) return [{ post, score: 0 }];

    const strong = normalize(
      [post.title, post.summary, ...post.tags.map((t) => t.name), ...post.keywords].filter(Boolean).join(" "),
    );
    const weak = normalize(
      [stripHtml(post.html), post.kind === "chord" ? post.chord.name : "", post.image?.alt].join(" "),
    );

    let score = 0;
    for (const word of words) {
      if (strong.includes(word)) score += 3;
      else if (weak.includes(word)) score += 1;
      else return []; // falta uma palavra: não é este registro
    }
    return [{ post, score }];
  });

  // Mais relevante primeiro; empate fica na ordem do fluxo (mais recente antes).
  return scored.sort((a, b) => b.score - a.score).map(({ post }) => post);
}
