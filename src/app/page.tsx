import { Suspense, type CSSProperties } from "react";
import { connection } from "next/server";
import { site } from "@/config/site";
import { getPassageCounts } from "@/infrastructure/passages";
import { getAllPosts } from "@/infrastructure/posts";
import { Backdrop } from "@/presentation/components/backdrop";
import { AFTER_THREAD, PostBody, PostMoment, THREAD_X, postHref } from "@/presentation/components/post";
import { SiteFrame } from "@/presentation/components/site-frame";
import { daysBetween, passageGap } from "@/presentation/format/time-passage";

export default function Home() {
  return (
    <>
      <Backdrop />

      <SiteFrame>
        <main className="flex-1">
          {/* Uma palavra só, emergindo da névoa: é o nome e é toda a explicação. */}
          <section className="relative grid min-h-[78svh] content-end pb-24">
            <h1
              aria-label={`${site.name} — ${site.author}`}
              className={`motto ${AFTER_THREAD} text-[clamp(3.25rem,7vw,5.5rem)] leading-none font-extralight italic tracking-[-0.03em] text-ink/90`}
            >
              <span className="motto-noise inline-block">{site.name}</span>
              {/* O ponto é uma luz de gravação, respirando no vermelho da paleta. */}
              <span className="motto-mark not-italic text-signal">.</span>
            </h1>
            {/* O fio começa aqui, logo abaixo da frase. */}
            <span
              aria-hidden
              className={`absolute bottom-0 ${THREAD_X} h-16 w-px bg-linear-to-b from-transparent to-signal/40`}
            />
          </section>

          <section aria-labelledby="registros" className="relative flow-root pb-32">
            <h2 id="registros" className="sr-only">
              Registros
            </h2>
            <span
              aria-hidden
              className={`absolute inset-y-0 ${THREAD_X} w-px bg-linear-to-b from-signal/40 via-line to-transparent`}
            />

            {/* Sem fallback: o fio já está desenhado enquanto os registros chegam. */}
            <Suspense fallback={null}>
              <Feed />
            </Suspense>
          </section>
        </main>
      </SiteFrame>
    </>
  );
}

/** O fluxo: buscado no acesso (do cache), para que um registro novo não dependa de um novo build. */
async function Feed() {
  await connection();
  const posts = await getAllPosts();
  // As marcas mudam a cada visita: ficam fora do cache dos registros.
  const passages = await getPassageCounts(posts.map((post) => post.slug));

  if (posts.length === 0) {
    return <p className={`${AFTER_THREAD} mt-12 italic text-muted`}>silêncio, por enquanto.</p>;
  }

  return (
    <ol>
      {posts.map((post, index) => {
        const previous = posts[index - 1];
        const days = previous ? daysBetween(previous.publishedAt, post.publishedAt) : 0;
        const gap = previous ? passageGap(days) : 3;
        const style = {
          marginTop: `${gap}rem`,
          // Quanto mais antigo, mais fundo na névoa; volta à tona ao ser lido.
          "--age": Math.max(1 - index * 0.13, 0.45),
        } as CSSProperties;

        return (
          <li
            key={post.slug}
            id={post.slug}
            style={style}
            className="group relative opacity-(--age) transition-opacity duration-700 hover:opacity-100 focus-within:opacity-100"
          >
            {/* O silêncio entre dois registros, escrito baixinho no meio do intervalo. */}
            {days > 1 && (
              <span
                aria-hidden
                style={{ top: `-${gap / 2}rem` }}
                className="absolute left-0 hidden w-[8.5rem] -translate-y-1/2 text-right font-mono text-[0.65rem] tracking-[0.2em] text-muted/40 sm:block"
              >
                {days} dias
              </span>
            )}
            <PostMoment
              publishedAt={post.publishedAt}
              href={postHref(post.slug)}
              passages={passages[post.slug]}
            />
            <div className={AFTER_THREAD}>
              <PostBody post={post} mode="feed" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
