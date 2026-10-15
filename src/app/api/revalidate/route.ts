import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { POSTS_TAG } from "@/infrastructure/posts";

/**
 * Webhook do Strapi: a cada registro publicado, editado ou apagado, o fluxo
 * fica obsoleto e a próxima visita já busca a versão nova.
 * No painel: Settings → Webhooks, cabeçalho `x-revalidate-secret`.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const received = request.headers.get("x-revalidate-secret") ?? "";

  if (!secret || !safeEqual(received, secret)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  revalidateTag(POSTS_TAG, "max");
  return Response.json({ revalidated: true });
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
