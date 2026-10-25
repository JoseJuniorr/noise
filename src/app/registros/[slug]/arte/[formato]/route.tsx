import { getPostBySlug } from "@/infrastructure/posts";
import { isArtFormat, renderPostArt } from "@/presentation/og/post-art";

/**
 * Arte pronta de um registro: /registros/<slug>/arte/stories | feed | og.
 * PNG gerado sob demanda; o texto do registro vem do cache, então gerar é barato.
 */
export async function GET(_request: Request, { params }: RouteContext<"/registros/[slug]/arte/[formato]">) {
  const { slug, formato } = await params;
  if (!isArtFormat(formato)) {
    return new Response("formato desconhecido (use stories, feed ou og)", { status: 404 });
  }

  const post = await getPostBySlug(slug);
  if (!post) return new Response("registro não encontrado", { status: 404 });

  return renderPostArt(post, formato, {
    "Content-Disposition": `inline; filename="noise-${slug}-${formato}.png"`,
    // Uma edição no CMS aparece na arte em até 10 minutos.
    "Cache-Control": "public, max-age=600",
  });
}
