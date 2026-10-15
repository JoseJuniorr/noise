"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * Monta a URL de entrega de uma imagem.
 *
 * - Id público do Cloudinary ("noise/ensaio"): `f_auto` escolhe AVIF/WebP pelo
 *   navegador e `c_limit` nunca amplia além do original.
 * - Caminho local ("/imagens/x.jpg", em `public/`): servido como está, sem
 *   otimização — ponte até a imagem ir para o Cloudinary.
 */
export function cloudinaryUrl(
  cloudName: string | undefined,
  { src, width, quality }: ImageLoaderProps,
): string {
  // `?w=` só para o next/image ver que a largura foi respeitada; o arquivo estático ignora.
  if (src.startsWith("/")) return `${src}?w=${width}`;

  if (!cloudName) {
    throw new Error(
      "Imagem sem Cloudinary configurado: defina NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no .env.local.",
    );
  }
  const transformations = ["f_auto", "c_limit", `w_${width}`, `q_${quality ?? "auto"}`].join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${src}`;
}

/** Loader global do next/image (ver `images.loaderFile` em next.config.ts). */
export default function cloudinaryLoader(props: ImageLoaderProps): string {
  return cloudinaryUrl(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, props);
}
