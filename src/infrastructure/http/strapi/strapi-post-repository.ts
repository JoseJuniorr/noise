import { InvalidPostError, type Post } from "@/core/domain/post";
import type { PostRepository } from "@/core/ports/post-repository";
import { mapStrapiPost, type StrapiPost } from "./map-strapi-post";

type Options = {
  /** URL interna do Strapi (no compose: http://cms:1337). */
  baseUrl: string;
  /** API token só de leitura, criado no painel do Strapi. */
  token?: string;
  /** Fuso de quem escreve: o Strapi guarda UTC, o fluxo mostra a hora local. */
  timeZone: string;
  fetch?: typeof fetch;
};

type Page = {
  data: StrapiPost[];
  meta: { pagination: { page: number; pageCount: number } };
};

// O máximo que a API aceita por página (config/api.ts do Strapi).
const PAGE_SIZE = 100;

/**
 * Adaptador da fase 2: lê os registros publicados pela API REST do Strapi 5.
 * Um registro inválido fica de fora (com log) em vez de derrubar o site
 * inteiro — diferente do Markdown, aqui o erro nasce em produção, não no build.
 */
export class StrapiPostRepository implements PostRepository {
  private readonly fetch: typeof fetch;

  constructor(private readonly options: Options) {
    this.fetch = options.fetch ?? fetch;
  }

  async findAll(): Promise<Post[]> {
    const posts: Post[] = [];
    for (let page = 1, pageCount = 1; page <= pageCount; page++) {
      const result = await this.request({ "pagination[page]": String(page) });
      pageCount = result.meta.pagination.pageCount;
      posts.push(...this.mapValid(result.data));
    }
    return posts;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const result = await this.request({ "filters[slug][$eq]": slug });
    return this.mapValid(result.data)[0] ?? null;
  }

  private async request(params: Record<string, string>): Promise<Page> {
    const url = new URL("/api/posts", this.options.baseUrl);
    url.searchParams.set("populate", "image");
    url.searchParams.set("pagination[pageSize]", String(PAGE_SIZE));
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    const response = await this.fetch(url, {
      headers: this.options.token ? { Authorization: `Bearer ${this.options.token}` } : {},
    });
    if (!response.ok) {
      throw new Error(`Strapi respondeu ${response.status} em ${url.pathname}${url.search}`);
    }
    return (await response.json()) as Page;
  }

  private mapValid(data: StrapiPost[]): Post[] {
    return data.flatMap((raw) => {
      try {
        return [mapStrapiPost(raw, this.options.timeZone)];
      } catch (error) {
        if (!(error instanceof InvalidPostError)) throw error;
        console.error(`[noise] registro ignorado — ${error.message}`);
        return [];
      }
    });
  }
}
