import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Post } from "@/core/domain/post";
import type { PostRepository } from "@/core/ports/post-repository";
import { parsePost } from "./parse-post";

const EXTENSION = ".md";
// O slug vira nome de arquivo: só letras minúsculas, números e hífens — nada de "../".
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Adaptador da fase 1: cada registro é um arquivo `<slug>.md` numa pasta.
 * O nome do arquivo é o slug; data, forma e título vêm do front-matter.
 */
export class MarkdownPostRepository implements PostRepository {
  constructor(private readonly directory: string) {}

  async findAll(): Promise<Post[]> {
    const files = (await readdir(this.directory)).filter((file) => file.endsWith(EXTENSION));
    return Promise.all(files.map((file) => this.read(path.basename(file, EXTENSION))));
  }

  async findBySlug(slug: string): Promise<Post | null> {
    if (!SAFE_SLUG.test(slug)) return null;
    try {
      return await this.read(slug);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  private async read(slug: string): Promise<Post> {
    const source = await readFile(path.join(this.directory, `${slug}${EXTENSION}`), "utf8");
    return parsePost(slug, source);
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
