import { parseImageTreatment } from "@/core/domain/image-treatment";
import { InvalidPostError, POST_KINDS, type ImageRef, type Post, type PostKind } from "@/core/domain/post";
import { renderMarkdown } from "@/infrastructure/persistence/render-markdown";

/** Um registro como a API REST do Strapi 5 devolve (formato plano, sem `attributes`). */
export type StrapiPost = {
  slug: string;
  /** Instante em UTC, ex.: "2026-10-13T02:41:00.000Z". */
  writtenAt: string;
  kind: string;
  title?: string | null;
  body?: string | null;
  chordName?: string | null;
  chordShape?: string | null;
  image?: StrapiMedia | null;
  imageFilter?: string | null;
  imageRatio?: string | null;
  imageFocus?: string | null;
};

type StrapiMedia = {
  alternativeText?: string | null;
  provider_metadata?: { public_id?: string } | null;
};

/**
 * Converte um registro do Strapi no `Post` do domínio. O instante UTC volta a
 * ser a hora local de quem escreveu, no mesmo formato dos arquivos Markdown.
 */
export function mapStrapiPost(raw: StrapiPost, timeZone: string): Post {
  const { slug } = raw;
  const text = (value: string | null | undefined) => value?.trim() || undefined;

  const kind = raw.kind as PostKind;
  if (!POST_KINDS.includes(kind)) {
    throw new InvalidPostError(slug, `"kind" deve ser um de ${POST_KINDS.join(", ")}, veio "${raw.kind}"`);
  }

  // O site guarda só o public_id; o loader do next/image monta a URL do Cloudinary.
  // Fora da forma "photo", imagem sem descrição é tratada como decorativa.
  const publicId = raw.image?.provider_metadata?.public_id;
  const image: ImageRef | undefined = publicId
    ? {
        publicId,
        alt: text(raw.image?.alternativeText) ?? "",
        treatment: parseImageTreatment({ filter: raw.imageFilter, ratio: raw.imageRatio, focus: raw.imageFocus }),
      }
    : undefined;

  const base = {
    slug,
    publishedAt: toLocalMoment(raw.writtenAt, timeZone, slug),
    title: text(raw.title),
    html: renderMarkdown(raw.body ?? ""),
    image,
  };

  switch (kind) {
    case "text":
    case "code":
      return { ...base, kind };
    case "chord": {
      const name = text(raw.chordName);
      if (!name) throw new InvalidPostError(slug, 'registro de acorde sem "chordName"');
      return { ...base, kind, chord: { name, shape: text(raw.chordShape) } };
    }
    case "photo": {
      if (!image) throw new InvalidPostError(slug, "foto sem imagem no Cloudinary");
      if (!image.alt) throw new InvalidPostError(slug, 'foto sem texto alternativo ("Alternative text" no painel)');
      return { ...base, kind, image };
    }
  }
}

/** "2026-10-13T02:41:00.000Z" em America/Sao_Paulo → "2026-10-12T23:41". */
function toLocalMoment(instant: string, timeZone: string, slug: string): string {
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) {
    throw new InvalidPostError(slug, `"writtenAt" inválido: "${instant}"`);
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
