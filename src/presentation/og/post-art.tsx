import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import type { Post } from "@/core/domain/post";
import { cloudinaryArtImage } from "@/infrastructure/images/cloudinary-transformations";
import { formatDiaryDate } from "@/presentation/format/diary-date";
import { toPlainText } from "@/presentation/format/lead";

/**
 * Artes de compartilhamento de um registro, no layout do noise.: a imagem do
 * post afundada no escuro, o título (ou o começo do texto), a data na margem,
 * a marca e o endereço. Geradas sob demanda com ImageResponse (Satori), que só
 * entende flexbox e um pedaço do CSS — os fades são degradês sobrepostos.
 */

export const ART_FORMATS = {
  stories: { width: 1080, height: 1920, imageHeight: 1180, pad: 96 },
  feed: { width: 1080, height: 1350, imageHeight: 760, pad: 88 },
  og: { width: 1200, height: 630, imageHeight: 630, pad: 64 },
} as const;

export type ArtFormat = keyof typeof ART_FORMATS;

export const isArtFormat = (value: string): value is ArtFormat => value in ART_FORMATS;

// Mesma paleta do site (globals.css).
const BG = "#0e0e0c";
const INK = "#e9e4d8";
const MUTED = "#8c877c";
const SIGNAL = "#e5533a";
const LINE = "#2a2925";

type ArtFonts = NonNullable<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]>;
let fonts: Promise<ArtFonts> | undefined;

/** Fontes do site em WOFF estático (o gerador não lê WOFF2 nem fontes variáveis). */
function loadFonts() {
  const file = (name: string) => readFile(path.join(process.cwd(), "assets", "fonts", name));
  fonts ??= Promise.all([
    file("newsreader-latin-400-normal.woff"),
    file("newsreader-latin-400-italic.woff"),
    file("newsreader-latin-300-italic.woff"),
    file("ibm-plex-mono-latin-400-normal.woff"),
  ]).then(([regular, italic, lightItalic, mono]) => [
    { name: "Newsreader", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Newsreader", data: italic, weight: 400 as const, style: "italic" as const },
    { name: "Newsreader", data: lightItalic, weight: 300 as const, style: "italic" as const },
    { name: "Plex Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ]);
  return fonts;
}

/** Endereço curto do registro, como aparece impresso na arte. */
export const shortPostUrl = (slug: string) => `${new URL(site.url).host}/registros/${slug}`;

function momentLabel(publishedAt: string): string {
  const time = publishedAt.slice(11, 16);
  return `${formatDiaryDate(publishedAt.slice(0, 10))}${time ? ` · ${time}` : ""}`;
}

/** O título encolhe com o tamanho: frase curta é grande, frase longa respira. */
function titleSize(text: string, format: ArtFormat): number {
  const base = { stories: 88, feed: 76, og: 58 }[format];
  if (text.length > 110) return Math.round(base * 0.62);
  if (text.length > 70) return Math.round(base * 0.75);
  if (text.length > 40) return Math.round(base * 0.88);
  return base;
}

export async function renderPostArt(post: Post, format: ArtFormat, headers?: Record<string, string>) {
  const spec = ART_FORMATS[format];
  const horizontal = format === "og";
  const imageWidth = horizontal ? 640 : spec.width;
  const imageUrl =
    post.image &&
    cloudinaryArtImage(post.image, {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      siteUrl: site.url,
      width: imageWidth,
      height: spec.imageHeight,
    });

  const plain = toPlainText(post.html, format === "stories" ? 230 : format === "feed" ? 150 : 120);
  // O que ocupa o lugar do título: o título, o acorde, ou o próprio começo do texto.
  const headline = post.title ?? (post.kind === "chord" ? post.chord.name : plain);
  const showExcerpt = Boolean(post.title || post.kind === "chord") && plain.length > 0;
  const isChordHeadline = !post.title && post.kind === "chord";

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: horizontal ? 18 : 28 }}>
      {/* Margem do caderno: o ponto sobre o fio e o instante. */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "Plex Mono", fontSize: horizontal ? 20 : 28, color: MUTED }}>
        <div style={{ width: horizontal ? 7 : 9, height: horizontal ? 7 : 9, background: SIGNAL }} />
        {momentLabel(post.publishedAt)}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: isChordHeadline ? titleSize("Dadd9", format) * 1.8 : titleSize(headline, format),
          fontStyle: isChordHeadline ? "italic" : "normal",
          fontWeight: isChordHeadline ? 300 : 400,
          lineHeight: 1.08,
          letterSpacing: -1,
          color: INK,
        }}
      >
        {headline}
      </div>

      {post.kind === "chord" && post.chord.shape && (
        <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: horizontal ? 20 : 28, letterSpacing: 8, color: MUTED }}>
          {post.chord.shape}
        </div>
      )}

      {showExcerpt && (
        <div
          style={{
            display: "flex",
            fontFamily: post.kind === "code" ? "Plex Mono" : "Newsreader",
            fontSize: horizontal ? 24 : format === "stories" ? 40 : 34,
            lineHeight: 1.45,
            color: MUTED,
          }}
        >
          {plain}
        </div>
      )}
    </div>
  );

  // Assinatura: a marca do site e o endereço do registro, para quem vê a arte achar o texto.
  const signature = (
    <div
      style={{
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        alignItems: horizontal ? "flex-end" : "flex-start",
        justifyContent: "space-between",
        gap: horizontal ? 0 : 14,
        paddingTop: horizontal ? 22 : 36,
        borderTop: `1px solid ${LINE}`,
      }}
    >
      <div style={{ display: "flex", fontSize: horizontal ? 52 : 96, fontStyle: "italic", fontWeight: 300, letterSpacing: -2, lineHeight: 1, color: INK }}>
        noise<span style={{ color: SIGNAL, fontStyle: "normal" }}>.</span>
      </div>
      <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: horizontal ? 18 : 27, color: MUTED, letterSpacing: 1 }}>
        {shortPostUrl(post.slug)}
      </div>
    </div>
  );

  // Névoa: sem imagem, uma luz difusa no lugar dela.
  const fog = "radial-gradient(circle at 72% 22%, rgba(233,228,216,0.09), rgba(14,14,12,0) 62%)";

  const element = horizontal ? (
    <div style={{ display: "flex", width: "100%", height: "100%", background: BG, color: INK, fontFamily: "Newsreader", position: "relative" }}>
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori só desenha <img> */}
          <img src={imageUrl} width={imageWidth} height={spec.imageHeight} alt="" style={{ position: "absolute", top: 0, left: spec.width - imageWidth, width: imageWidth, height: spec.imageHeight, objectFit: "cover", opacity: 0.9 }} />
          <div style={{ position: "absolute", top: 0, left: spec.width - imageWidth, width: imageWidth, height: spec.imageHeight, backgroundImage: `linear-gradient(to right, ${BG} 0%, rgba(14,14,12,0.6) 30%, rgba(14,14,12,0) 65%, rgba(14,14,12,0.35) 100%)` }} />
        </>
      ) : (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: fog }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700, height: "100%", padding: spec.pad, position: "relative" }}>
        <div style={{ display: "flex", fontStyle: "italic", fontSize: 26, color: INK }}>{site.author}</div>
        {content}
        {signature}
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: BG, color: INK, fontFamily: "Newsreader", position: "relative" }}>
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori só desenha <img> */}
          <img src={imageUrl} width={spec.width} height={spec.imageHeight} alt="" style={{ position: "absolute", top: 0, left: 0, width: spec.width, height: spec.imageHeight, objectFit: "cover", opacity: 0.88 }} />
          {/* A imagem afunda no escuro: embaixo, nas laterais e um pouco no topo. */}
          <div style={{ position: "absolute", top: 0, left: 0, width: spec.width, height: spec.imageHeight, backgroundImage: `linear-gradient(to bottom, rgba(14,14,12,0.55) 0%, rgba(14,14,12,0) 22%, rgba(14,14,12,0) 52%, ${BG} 100%)` }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: spec.width, height: spec.imageHeight, backgroundImage: `linear-gradient(to right, rgba(14,14,12,0.7) 0%, rgba(14,14,12,0) 22%, rgba(14,14,12,0) 78%, rgba(14,14,12,0.7) 100%)` }} />
        </>
      ) : (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: fog }} />
      )}
      {/* O fio vermelho da margem, como no site. */}
      <div style={{ position: "absolute", left: spec.pad - 30, top: spec.imageHeight * 0.55, width: 2, height: spec.height - spec.imageHeight * 0.55 - spec.pad, backgroundImage: `linear-gradient(to bottom, rgba(229,83,58,0), rgba(229,83,58,0.45) 30%, rgba(229,83,58,0.15))` }} />

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: spec.pad, position: "relative" }}>
        <div style={{ display: "flex", fontStyle: "italic", fontSize: format === "stories" ? 38 : 34, color: INK }}>{site.author}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: format === "stories" ? 64 : 48 }}>
          {content}
          {signature}
        </div>
      </div>
    </div>
  );

  return new ImageResponse(element, { width: spec.width, height: spec.height, fonts: await loadFonts(), headers });
}
