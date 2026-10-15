// @vitest-environment node
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MarkdownPostRepository } from "./markdown-post-repository";

describe("MarkdownPostRepository", () => {
  let directory: string;
  let repository: MarkdownPostRepository;

  beforeAll(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "noise-posts-"));
    await writeFile(path.join(directory, "um.md"), "---\ndate: 2026-10-01\n---\nUm.");
    await writeFile(path.join(directory, "dois.md"), "---\ndate: 2026-10-02\n---\nDois.");
    await writeFile(path.join(directory, "rascunho.txt"), "ignorado");
    repository = new MarkdownPostRepository(directory);
  });

  afterAll(() => rm(directory, { recursive: true, force: true }));

  it("lê todos os .md da pasta, usando o nome do arquivo como slug", async () => {
    const slugs = (await repository.findAll()).map((post) => post.slug).sort();
    expect(slugs).toEqual(["dois", "um"]);
  });

  it("encontra um registro pelo slug", async () => {
    expect((await repository.findBySlug("um"))?.html).toBe("<p>Um.</p>");
  });

  it("devolve null para slug inexistente ou que tenta sair da pasta", async () => {
    expect(await repository.findBySlug("nao-existe")).toBeNull();
    expect(await repository.findBySlug("../segredo")).toBeNull();
  });
});
