import { describe, expect, it } from "vitest";
import type { Post } from "@/core/domain/post";
import { normalize, searchPosts } from "./search-posts";

const post = (slug: string, extra: Partial<Post> = {}): Post =>
  ({ slug, publishedAt: "2026-10-01", kind: "text", html: "", tags: [], keywords: [], ...extra }) as Post;

const posts: Post[] = [
  post("casa", { title: "O peso de uma casa vazia", html: "<p>O Bruce voltou.</p>", tags: [{ name: "Cotidiano", slug: "cotidiano" }] }),
  post("disco", { title: "O que o disco diz", html: "<p>Uma canção sobre a casa.</p>", keywords: ["álbum", "resenha"] }),
  post("acorde", { kind: "chord", chord: { name: "Dadd9" }, html: "<p>Ficou tocando.</p>", tags: [{ name: "Música", slug: "musica" }] } as Partial<Post>),
];

describe("normalize", () => {
  it("ignora acentos e maiúsculas", () => {
    expect(normalize("Canção ÁLBUM")).toBe("cancao album");
  });
});

describe("searchPosts", () => {
  it("encontra sem acento e põe o título na frente do corpo do texto", () => {
    expect(searchPosts(posts, { text: "casa" }).map((p) => p.slug)).toEqual(["casa", "disco"]);
  });

  it("exige todas as palavras", () => {
    expect(searchPosts(posts, { text: "casa bruce" }).map((p) => p.slug)).toEqual(["casa"]);
    expect(searchPosts(posts, { text: "casa inexistente" })).toEqual([]);
  });

  it("acha por palavra-chave e pelo nome do acorde", () => {
    expect(searchPosts(posts, { text: "album" }).map((p) => p.slug)).toEqual(["disco"]);
    expect(searchPosts(posts, { text: "dadd9" }).map((p) => p.slug)).toEqual(["acorde"]);
  });

  it("filtra por tag, sozinha ou com texto", () => {
    expect(searchPosts(posts, { tag: "musica" }).map((p) => p.slug)).toEqual(["acorde"]);
    expect(searchPosts(posts, { tag: "cotidiano", text: "disco" })).toEqual([]);
  });

  it("sem busca, devolve o fluxo como está", () => {
    expect(searchPosts(posts, {}).map((p) => p.slug)).toEqual(["casa", "disco", "acorde"]);
  });
});
