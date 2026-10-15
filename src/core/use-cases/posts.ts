import { byNewestFirst, type Post } from "@/core/domain/post";
import type { PostRepository } from "@/core/ports/post-repository";

/** O fluxo inteiro, do registro mais recente ao mais antigo. */
export async function listPosts(repository: PostRepository): Promise<Post[]> {
  const posts = await repository.findAll();
  return posts.toSorted(byNewestFirst);
}

export async function findPost(repository: PostRepository, slug: string): Promise<Post | null> {
  return repository.findBySlug(slug);
}
