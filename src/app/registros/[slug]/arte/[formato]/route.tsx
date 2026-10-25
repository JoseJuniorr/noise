import { isAdmin } from "@/infrastructure/admin/admin";
import { getPostBySlug } from "@/infrastructure/posts";
import { isArtFormat, renderPostArt } from "@/presentation/og/post-art";

/**
 * Arte pronta de um registro: /registros/<slug>/arte/stories | feed | og.
 * Só para o administrador: gerar a imagem custa CPU do servidor, e o público
 * já tem a prévia de link (opengraph-image), que fica aberta para as redes.
 */
export async function GET(_request: Request, { params }: RouteContext<"/registros/[slug]/arte/[formato]">) {
  if (!(await isAdmin())) {
    return new Response("acesso restrito", { status: 401 });
  }

  const { slug, formato } = await params;
  if (!isArtFormat(formato)) {
    return new Response("formato desconhecido (use stories, feed ou og)", { status: 404 });
  }

  const post = await getPostBySlug(slug);
  if (!post) return new Response("registro não encontrado", { status: 404 });

  return renderPostArt(post, formato, {
    "Content-Disposition": `inline; filename="noise-${slug}-${formato}.png"`,
    // Particular (só existe para quem está logado); uma edição no CMS chega à arte em até 10 minutos.
    "Cache-Control": "private, max-age=600",
  });
}
