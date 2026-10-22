import { parse as parseYaml } from "yaml";
import { parseImageTreatment } from "@/core/domain/image-treatment";
import { InvalidPostError, POST_KINDS, type ImageRef, type Post, type PostKind } from "@/core/domain/post";
import { renderMarkdown } from "../render-markdown";

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const PUBLISHED_AT = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;

/**
 * Converte um arquivo de registro (front-matter YAML + corpo Markdown) no
 * `Post` do domínio. Pura: não toca no disco, só traduz texto.
 *
 * ```md
 * ---
 * date: 2026-10-12T23:41
 * kind: chord          # text (padrão) | code | chord | photo
 * title: opcional
 * chord: Dadd9         # só em chord, com `shape` opcional
 * image: noise/ensaio  # id no Cloudinary; obrigatória em photo (com `alt`), opcional nas demais
 * filter: sepia        # submersa (padrão) | natural | preto_e_branco | sepia | alto_contraste | vinheta
 * ratio: quadrado      # original (padrão) | quadrado | retrato | paisagem | panoramico
 * focus: rosto         # automatico (padrão) | rosto | centro | topo | base
 * ---
 * Corpo em Markdown.
 * ```
 */
export function parsePost(slug: string, source: string): Post {
  const match = FRONT_MATTER.exec(source);
  if (!match) throw new InvalidPostError(slug, "falta o front-matter entre linhas ---");

  const [, rawMeta, body] = match;
  const meta: unknown = parseYaml(rawMeta, { schema: "core" });
  if (!isRecord(meta)) throw new InvalidPostError(slug, "o front-matter precisa ser um objeto YAML");

  const read = (field: string, required = false): string | undefined => {
    const value = meta[field];
    if (value === undefined || value === null || value === "") {
      if (required) throw new InvalidPostError(slug, `o campo "${field}" é obrigatório`);
      return undefined;
    }
    // YAML devolve números para coisas como `title: 1984`; tudo aqui é texto.
    if (typeof value !== "string" && typeof value !== "number") {
      throw new InvalidPostError(slug, `o campo "${field}" precisa ser texto`);
    }
    return String(value).trim();
  };

  const publishedAt = read("date", true)!;
  if (!PUBLISHED_AT.test(publishedAt)) {
    throw new InvalidPostError(slug, `"date" deve ser AAAA-MM-DD ou AAAA-MM-DDTHH:MM, veio "${publishedAt}"`);
  }

  const kind = (read("kind") ?? "text") as PostKind;
  if (!POST_KINDS.includes(kind)) {
    throw new InvalidPostError(slug, `"kind" deve ser um de ${POST_KINDS.join(", ")}, veio "${kind}"`);
  }

  // Imagem em qualquer forma; na foto ela é obrigatória e precisa de descrição.
  const publicId = read("image", kind === "photo");
  const image: ImageRef | undefined = publicId
    ? {
        publicId,
        alt: read("alt", kind === "photo") ?? "",
        treatment: parseImageTreatment({ filter: read("filter"), ratio: read("ratio"), focus: read("focus") }),
      }
    : undefined;

  const base = {
    slug,
    publishedAt,
    title: read("title"),
    html: renderMarkdown(body),
    image,
  };

  switch (kind) {
    case "text":
    case "code":
      return { ...base, kind };
    case "chord":
      return { ...base, kind, chord: { name: read("chord", true)!, shape: read("shape") } };
    case "photo":
      return { ...base, kind, image: image! };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
