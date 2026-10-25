import { describe, expect, it } from "vitest";
import type { Post } from "@/core/domain/post";
import type { PostRepository } from "@/core/ports/post-repository";
import { findPost, listPosts } from "./posts";

const post = (slug: string, publishedAt: string): Post => ({
  slug,
  publishedAt,
  kind: "text",
  html: `<p>${slug}</p>`,
  tags: [],
  keywords: [],
});

/** Adaptador em memória: prova que o caso de uso não depende de onde os dados vêm. */
function inMemory(posts: Post[]): PostRepository {
  return {
    findAll: async () => [...posts],
    findBySlug: async (slug) => posts.find((p) => p.slug === slug) ?? null,
  };
}

describe("listPosts", () => {
  it("entrega o fluxo do mais recente para o mais antigo", async () => {
    const repository = inMemory([
      post("antigo", "2026-09-14T22:30"),
      post("recente", "2026-10-12T23:41"),
      post("meio", "2026-10-04"),
    ]);

    const slugs = (await listPosts(repository)).map((p) => p.slug);

    expect(slugs).toEqual(["recente", "meio", "antigo"]);
  });

  it("desempata registros do mesmo instante pelo slug, para a ordem ser estável", async () => {
    const repository = inMemory([post("b", "2026-10-12T10:00"), post("a", "2026-10-12T10:00")]);

    expect((await listPosts(repository)).map((p) => p.slug)).toEqual(["a", "b"]);
  });
});

describe("findPost", () => {
  it("encontra pelo slug ou devolve null", async () => {
    const repository = inMemory([post("existe", "2026-10-12")]);

    expect((await findPost(repository, "existe"))?.slug).toBe("existe");
    expect(await findPost(repository, "nao-existe")).toBeNull();
  });
});
