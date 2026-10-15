import type { CSSProperties } from "react";
import Image from "next/image";

type Props = {
  /** Id no Cloudinary ou caminho em `public/`. Sem foto, renderiza uma névoa abstrata no mesmo tratamento. */
  src?: string | null;
  /** Com `alt`, a foto é conteúdo (um registro); sem, é atmosfera e fica oculta para leitores de tela. */
  alt?: string;
  /** Ponto da foto que fica nítido e no centro do recorte (CSS object-position, ex.: "60% 70%"). */
  focus?: string;
  /** Segundo ponto nítido, numa faixa horizontal estreita (ex.: o braço de um instrumento). */
  detail?: string;
  /**
   * Posição e máscaras de fade (utilitários `mask-*` do Tailwind), ex.:
   * "fixed inset-y-0 right-0 w-[60vw] mask-l-from-40% mask-b-from-50%".
   */
  className?: string;
  sizes?: string;
};

/**
 * Foto "submersa": dessaturada, ondulada como sob a água, nítida só no foco e
 * desfocando até se desfazer em grão — afundada no fundo, não colada nele.
 * Em `screen`, o preto da foto some e só a luz dela emerge das sombras.
 * Requer <WaterFilter /> na página.
 */
export function SubmergedPhoto({
  src,
  alt,
  focus = "50% 50%",
  detail,
  className = "",
  sizes = "60vw",
}: Props) {
  const layer = (variant: "soft" | "sharp") =>
    src ? (
      <Image
        src={src}
        // Só a camada nítida descreve a foto; a desfocada é eco dela.
        alt={variant === "sharp" ? (alt ?? "") : ""}
        fill
        sizes={sizes}
        style={{ objectPosition: focus }}
        className={`submerged-layer submerged-layer--${variant} object-cover`}
      />
    ) : (
      <div className={`submerged-layer submerged-layer--${variant} submerged-haze`} />
    );

  return (
    <div
      aria-hidden={!alt}
      style={{ "--focus": focus, "--detail": detail } as CSSProperties}
      className={`submerged pointer-events-none select-none ${className}`}
    >
      {/* Máscara própria de grão: a borda esfarela em vez de terminar num degradê liso. */}
      <div className="submerged-grain">
        <div className="submerged-media">
          {layer("soft")}
          {layer("sharp")}
        </div>
      </div>
    </div>
  );
}

/** Distorção de água compartilhada pelas fotos submersas (um único id por página). */
export function WaterFilter() {
  return (
    <svg aria-hidden className="absolute h-0 w-0" focusable="false">
      <filter id="submerso" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="2" seed="7">
          <animate
            attributeName="baseFrequency"
            dur="40s"
            values="0.008 0.02;0.011 0.026;0.008 0.02"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="12" />
      </filter>
    </svg>
  );
}
