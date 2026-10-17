import { submergedPhoto } from "@/config/site";
import { SubmergedPhoto, WaterFilter } from "./submerged-photo";

/**
 * Fundo comum às páginas: a foto afundada à direita, a névoa por cima dela e
 * o crédito de quem fotografou. `strength` apaga a foto onde se lê mais.
 */
export function Backdrop({ strength = 1 }: { strength?: number }) {
  return (
    <>
      <WaterFilter />
      <div style={{ "--backdrop-strength": strength } as React.CSSProperties}>
        <SubmergedPhoto
          src={submergedPhoto?.publicId}
          focus={submergedPhoto?.focus}
          detail={submergedPhoto?.detail}
          sizes="(min-width: 768px) 62vw, 100vw"
          className="emerge fixed inset-y-0 right-0 w-full mask-l-from-65% mask-r-from-88% mask-b-from-80% mask-t-from-88% [--photo-strength:var(--backdrop-strength)] max-sm:[--photo-strength:calc(var(--backdrop-strength)*0.6)] md:w-[62vw]"
        />
      </div>
      <div aria-hidden className="fog" />

      {/* Crédito de quem fotografou: vertical, colado à borda da foto, como legenda de galeria. */}
      {submergedPhoto?.credit && (
        <p className="fixed right-3 bottom-6 z-10 font-mono text-xs lowercase tracking-[0.2em] text-muted [writing-mode:vertical-rl] sm:right-5">
          foto · {submergedPhoto.credit}
        </p>
      )}
    </>
  );
}
