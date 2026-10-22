import { DEFAULT_TREATMENT, type ImageRef, type ImageTreatment } from "@/core/domain/post";

const EFFECTS: Record<ImageTreatment["filter"], string | null> = {
  submersa: null, // o tratamento submerso é feito no próprio site (CSS)
  natural: null,
  preto_e_branco: "e_grayscale",
  sepia: "e_sepia:60",
  alto_contraste: "e_contrast:40",
  vinheta: "e_vignette:50",
};

const RATIOS: Record<ImageTreatment["ratio"], string | null> = {
  original: null,
  quadrado: "1:1",
  retrato: "4:5",
  paisagem: "3:2",
  panoramico: "21:9",
};

const GRAVITY: Record<ImageTreatment["focus"], string> = {
  automatico: "g_auto",
  rosto: "g_face",
  centro: "g_center",
  topo: "g_north",
  base: "g_south",
};

/**
 * `src` do next/image para uma imagem com tratamento: transformações do
 * Cloudinary antes do id público. O loader acrescenta formato e largura.
 * Caminhos locais ("/imagens/…") não passam pelo Cloudinary e saem como estão.
 */
export function cloudinarySrc(image: ImageRef): string {
  if (image.publicId.startsWith("/")) return image.publicId;

  const { filter, ratio, focus } = image.treatment ?? DEFAULT_TREATMENT;
  const steps = [
    RATIOS[ratio] && `ar_${RATIOS[ratio]},c_fill,${GRAVITY[focus]}`,
    EFFECTS[filter],
  ].filter(Boolean);

  return [...steps, image.publicId].join("/");
}

/**
 * URL absoluta de prévia para redes sociais (Open Graph, 1200×630), cortada
 * pelo foco do tratamento. Imagens locais e Cloudinary sem configuração não têm prévia.
 */
export function cloudinaryShareImage(image: ImageRef, cloudName: string | undefined): string | undefined {
  if (!cloudName || image.publicId.startsWith("/")) return undefined;
  const gravity = GRAVITY[(image.treatment ?? DEFAULT_TREATMENT).focus];
  const effect = EFFECTS[(image.treatment ?? DEFAULT_TREATMENT).filter];
  const steps = [`c_fill,w_1200,h_630,${gravity}`, effect, "f_jpg,q_auto"].filter(Boolean).join("/");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${steps}/${image.publicId}`;
}
