import { parsePassageName } from "@/core/domain/passage";
import { getPostBySlug } from "@/infrastructure/posts";
import { leavePassage } from "@/infrastructure/passages";
import { createRateLimiter } from "@/infrastructure/rate-limit";

// Generoso para quem lê vários registros, curto para quem tenta inflar a contagem.
const allow = createRateLimiter({ limit: 30, windowMs: 60 * 60 * 1000 });

/**
 * Deixa uma marca "passei por aqui" num registro — com nome, se a pessoa quiser —
 * e devolve a nova contagem e os nomes recentes. Corpo opcional: { "name": "Ana" }.
 */
export async function POST(request: Request, { params }: RouteContext<"/api/passagens/[slug]">) {
  // Só o próprio site deixa marcas: o navegador sempre envia Origin num POST.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return Response.json({ error: "origem não permitida" }, { status: 403 });
  }

  // O IP só serve de chave do limite em memória; não é gravado em lugar nenhum.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
  if (!allow(ip)) {
    return Response.json({ error: "muitas passagens seguidas" }, { status: 429 });
  }

  const { slug } = await params;
  if (!(await getPostBySlug(slug))) {
    return Response.json({ error: "registro não encontrado" }, { status: 404 });
  }

  // Corpo vazio ou ilegível = marca anônima; nome fora da regra é recusado com o motivo.
  const body: unknown = await request.json().catch(() => ({}));
  const parsed = parsePassageName((body as { name?: unknown } | null)?.name);
  if (!parsed.ok) return Response.json({ error: parsed.reason }, { status: 400 });

  return Response.json(await leavePassage(slug, parsed.name));
}
