import Image from "next/image";
import { DEFAULT_TREATMENT, type ImageRef, type ImageTreatment } from "@/core/domain/post";
import { cloudinarySrc } from "@/infrastructure/images/cloudinary-transformations";
import { SubmergedPhoto } from "./submerged-photo";

const ASPECT: Record<ImageTreatment["ratio"], string> = {
  original: "aspect-4/3",
  quadrado: "aspect-square",
  retrato: "aspect-4/5",
  paisagem: "aspect-3/2",
  panoramico: "aspect-21/9",
};

type Props = {
  image: ImageRef;
  /**
   * "photo": a foto é o registro. "cover": imagem que acompanha um texto —
   * menor no fluxo, mais apagada, para não roubar o lugar das palavras.
   */
  role: "photo" | "cover";
  mode: "feed" | "full";
};

/** Imagem de um registro: submersa (o tratamento da casa) ou natural, com filtro. */
export function PostImage({ image, role, mode }: Props) {
  const treatment = image.treatment ?? DEFAULT_TREATMENT;
  const src = cloudinarySrc(image);
  const inFeed = mode === "feed";
  // Capa sem proporção escolhida fica larga e baixa: acompanha o texto em vez de competir com ele.
  const aspect = role === "cover" && treatment.ratio === "original" ? "aspect-21/9" : ASPECT[treatment.ratio];
  const width = inFeed ? (role === "cover" ? "max-w-sm" : "max-w-md") : "max-w-2xl";
  const sizes = inFeed ? "(min-width: 640px) 28rem, 90vw" : "(min-width: 768px) 42rem, 95vw";

  if (treatment.filter === "submersa") {
    return (
      <SubmergedPhoto
        src={src}
        alt={image.alt}
        sizes={sizes}
        className={`relative block w-full ${aspect} ${width} mask-radial-from-40% mask-radial-to-75% ${role === "cover" && inFeed ? "[--photo-strength:1.4]" : "[--photo-strength:2]"}`}
      />
    );
  }

  // Natural: a foto como ela é (com o filtro do Cloudinary), só as bordas se desfazem na névoa.
  return (
    <div
      className={`relative w-full overflow-hidden ${aspect} ${width} mask-radial-from-55% mask-radial-to-85% ${role === "cover" && inFeed ? "opacity-70" : "opacity-90"}`}
    >
      <Image src={src} alt={image.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
