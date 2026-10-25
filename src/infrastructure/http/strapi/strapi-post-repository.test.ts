// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StrapiPost } from "./map-strapi-post";
import { StrapiPostRepository } from "./strapi-post-repository";

const post = (slug: string, overrides: Partial<StrapiPost> = {}): StrapiPost => ({
  slug,
  writtenAt: "2026-10-13T02:41:00.000Z",
  kind: "text",
  body: slug,
  ...overrides,
});

/** Strapi falso: responde páginas fixas e guarda as URLs pedidas. */
function fakeStrapi(pages: StrapiPost[][]) {
  const requested: URL[] = [];
  const fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    requested.push(url);
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer token-leitura");
    const page = Number(url.searchParams.get("pagination[page]") ?? 1);
    return Response.json({
      data: pages[page - 1] ?? [],
      meta: { pagination: { page, pageCount: pages.length } },
    });
  });
  const repository = new StrapiPostRepository({
    baseUrl: "http://cms:1337",
    token: "token-leitura",
    timeZone: "America/Sao_Paulo",
    fetch,
  });
  return { repository, requested };
}

afterEach(() => vi.restoreAllMocks());

describe("StrapiPostRepository", () => {
  it("percorre todas as páginas da API", async () => {
    const { repository, requested } = fakeStrapi([[post("um"), post("dois")], [post("tres")]]);

    const slugs = (await repository.findAll()).map((p) => p.slug);

    expect(slugs).toEqual(["um", "dois", "tres"]);
    expect(requested).toHaveLength(2);
    expect(requested[0].pathname).toBe("/api/posts");
    expect(requested[0].searchParams.get("populate[image]")).toBe("true");
    expect(requested[0].searchParams.get("populate[tags][fields][0]")).toBe("name");
  });

  it("deixa de fora um registro inválido sem derrubar o fluxo", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { repository } = fakeStrapi([[post("bom"), post("quebrado", { kind: "chord" })]]);

    expect((await repository.findAll()).map((p) => p.slug)).toEqual(["bom"]);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"quebrado"'));
  });

  it("busca por slug com filtro exato, ou devolve null", async () => {
    const { repository, requested } = fakeStrapi([[post("dadd9")]]);

    expect((await repository.findBySlug("dadd9"))?.slug).toBe("dadd9");
    expect(requested[0].searchParams.get("filters[slug][$eq]")).toBe("dadd9");

    const empty = fakeStrapi([[]]);
    expect(await empty.repository.findBySlug("nada")).toBeNull();
  });

  it("falha alto quando o Strapi responde erro", async () => {
    const repository = new StrapiPostRepository({
      baseUrl: "http://cms:1337",
      timeZone: "America/Sao_Paulo",
      fetch: async () => new Response("não autorizado", { status: 401 }),
    });

    await expect(repository.findAll()).rejects.toThrow(/Strapi respondeu 401/);
  });
});
