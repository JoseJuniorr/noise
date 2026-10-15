import "server-only";

import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import type { Post } from "@/core/domain/post";
import type { PostRepository } from "@/core/ports/post-repository";
import { findPost, listPosts } from "@/core/use-cases/posts";
import { StrapiPostRepository } from "./http/strapi/strapi-post-repository";
import { MarkdownPostRepository } from "./persistence/markdown/markdown-post-repository";

/** Tag de cache de todo o conteúdo — o webhook do Strapi chama revalidateTag(POSTS_TAG). */
export const POSTS_TAG = "posts";

/**
 * Raiz de composição: o ÚNICO lugar que sabe de onde os registros vêm.
 * CONTENT_SOURCE=markdown (padrão) lê `content/posts`; =strapi lê a API do CMS.
 */
function createRepository(): PostRepository {
  const source = process.env.CONTENT_SOURCE ?? "markdown";
  switch (source) {
    case "markdown":
      return new MarkdownPostRepository(path.join(process.cwd(), "content", "posts"));
    case "strapi":
      return new StrapiPostRepository({
        baseUrl: required("STRAPI_URL"),
        token: process.env.STRAPI_API_TOKEN,
        timeZone: process.env.CONTENT_TIME_ZONE ?? "America/Sao_Paulo",
      });
    default:
      throw new Error(`CONTENT_SOURCE desconhecido: "${source}" (use "markdown" ou "strapi").`);
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} para CONTENT_SOURCE=strapi.`);
  return value;
}

// Criado no primeiro uso, não na importação: o build não precisa das variáveis do Strapi.
let repository: PostRepository | undefined;
const getRepository = () => (repository ??= createRepository());

// Em dev o cache vive segundos, para que editar um registro apareça ao recarregar.
const lifetime = () =>
  process.env.NODE_ENV === "development" ? cacheLife("seconds") : cacheLife("max");

export async function getAllPosts(): Promise<Post[]> {
  "use cache";
  lifetime();
  cacheTag(POSTS_TAG);
  return listPosts(getRepository());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  "use cache";
  lifetime();
  cacheTag(POSTS_TAG, `${POSTS_TAG}:${slug}`);
  return findPost(getRepository(), slug);
}
