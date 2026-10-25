import { getPostBySlug } from "@/infrastructure/posts";
import { ART_FORMATS, renderPostArt } from "@/presentation/og/post-art";

// Prévia de link (WhatsApp, LinkedIn, X…): a mesma arte do registro, em 1200×630.
export const size = { width: ART_FORMATS.og.width, height: ART_FORMATS.og.height };
export const contentType = "image/png";
export const alt = "Registro do noise.";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return new Response("registro não encontrado", { status: 404 });
  return renderPostArt(post, "og");
}
