import Link from "next/link";
import { site } from "@/config/site";
import { Backdrop } from "@/presentation/components/backdrop";
import { AFTER_THREAD } from "@/presentation/components/post";
import { SiteFrame } from "@/presentation/components/site-frame";

export default function NotFound() {
  return (
    <>
      <Backdrop strength={0.45} />
      <SiteFrame>
        <main className={`${AFTER_THREAD} flex-1 pt-[30svh]`}>
          <h1 className="text-3xl font-light italic">nada aqui.</h1>
          <p className="mt-4 text-muted">Este registro não existe, ou se perdeu na névoa.</p>
          <Link
            href="/"
            className="mt-10 inline-block font-mono text-xs lowercase tracking-[0.15em] text-muted transition-colors hover:text-ink"
          >
            ← {site.name}
            <span className="text-signal">.</span>
          </Link>
        </main>
      </SiteFrame>
    </>
  );
}
