import type { ImageRef } from "@/core/domain/post";

/** Identidade do site num único lugar — trocar nome/assinatura é editar só aqui. */
export const site = {
  name: "noise",
  author: "José Junior",
  since: 2026,
  motto: "Somewhere between code, noise & underground.",
  locale: "pt-BR",
} as const;

/**
 * Foto submersa no fundo da página.
 * - `publicId`: hoje um arquivo local em `public/` ("/imagens/…"); depois, o id no Cloudinary.
 * - `focus`: ponto da foto que fica no centro do recorte (CSS object-position).
 * - `detail`: segundo ponto nítido, numa faixa horizontal (opcional).
 * - `credit`: quem fotografou — sempre visível junto da foto.
 * Com `null`, fica só a névoa.
 */
export const submergedPhoto: (ImageRef & { focus?: string; detail?: string; credit?: string }) | null = {
  publicId: "/imagens/submersa.jpg",
  alt: "",
  // Rosto e tronco nítidos no centro; o braço do baixo atravessa embaixo e a marca d'água some na borda.
  focus: "26% 45%",
  // O braço do baixo, com as cordas e a mão, ganha uma faixa nítida própria.
  detail: "50% 84%",
  credit: "Lyrian Oliveira",
};
