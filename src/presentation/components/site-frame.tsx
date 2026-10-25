import Link from "next/link";
import { site } from "@/config/site";

/** Coluna central com o nome no topo e a assinatura no rodapé, igual em todas as páginas. */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-8">
      <header className="flex items-baseline justify-between gap-6 py-6">
        <Link href="/" className="text-lg italic tracking-tight">
          {site.author}
        </Link>
        <nav aria-label="Principal" className="flex gap-5 font-mono text-xs lowercase tracking-[0.14em] text-muted">
          <Link href="/busca" className="transition-colors hover:text-ink">
            buscar
          </Link>
          <Link href="/sobre" className="transition-colors hover:text-ink">
            sobre
          </Link>
        </nav>
      </header>

      {children}

      <footer className="flex justify-between gap-2 py-8 font-mono text-[0.7rem] lowercase tracking-[0.2em] text-muted/70">
        <span>{site.author.toLowerCase()}</span>
        <span>{site.since}</span>
      </footer>
    </div>
  );
}
