import { Suspense, type CSSProperties } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { site, submergedPhoto } from "@/config/site";
import type { Post } from "@/core/domain/post";
import { getAllPosts } from "@/infrastructure/posts";
import { SubmergedPhoto, WaterFilter } from "@/presentation/components/submerged-photo";
import { formatDiaryDate } from "@/presentation/format/diary-date";
import { daysBetween, passageGap } from "@/presentation/format/time-passage";

/*
 * O fio: uma linha vertical que nasce na frase e atravessa todos os registros.
 * No celular corre na borda esquerda; a partir de `sm` vira a margem do caderno.
 */
const THREAD_X = "left-0 sm:left-[10rem]";
const AFTER_THREAD = "pl-6 sm:pl-[11.5rem]";

export default function Home() {
  return (
    <>
      <WaterFilter />

      {/* Fundo: a foto afundada à direita, a névoa por cima dela. */}
      <SubmergedPhoto
        src={submergedPhoto?.publicId}
        focus={submergedPhoto?.focus}
        detail={submergedPhoto?.detail}
        sizes="(min-width: 768px) 62vw, 100vw"
        className="emerge fixed inset-y-0 right-0 w-full mask-l-from-65% mask-r-from-88% mask-b-from-80% mask-t-from-88% max-sm:[--photo-strength:0.6] md:w-[62vw]"
      />
      <div aria-hidden className="fog" />

      {/* Crédito de quem fotografou: vertical, colado à borda da foto, como legenda de galeria. */}
      {submergedPhoto?.credit && (
        <p className="fixed right-3 bottom-6 z-10 font-mono text-xs lowercase tracking-[0.2em] text-muted [writing-mode:vertical-rl] sm:right-5">
          foto · {submergedPhoto.credit}
        </p>
      )}

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-8">
        <header className="py-6">
          <Link href="/" className="text-lg italic tracking-tight">
            {site.author}
          </Link>
        </header>

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

        <footer className="flex justify-between gap-2 py-8 font-mono text-[0.7rem] lowercase tracking-[0.2em] text-muted/70">
          <span>{site.author.toLowerCase()}</span>
          <span>{site.since}</span>
        </footer>
      </div>
    </>
  );
}

/** O fluxo: buscado no acesso (do cache), para que um registro novo não dependa de um novo build. */
async function Feed() {
  await connection();
  const posts = await getAllPosts();

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
            <PostMoment publishedAt={post.publishedAt} />
            <div className={AFTER_THREAD}>
              <PostBody post={post} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Data (e hora, quando houver) na margem, com um ponto sobre o fio marcando o instante. */
function PostMoment({ publishedAt }: { publishedAt: string }) {
  const time = publishedAt.slice(11, 16);
  return (
    <>
      <span
        aria-hidden
        className="absolute top-2.5 left-0 size-[5px] -translate-x-[2px] bg-muted transition-colors duration-700 group-hover:bg-signal sm:left-[10rem]"
      />
      <p className="mb-3 pl-6 font-mono text-xs text-muted sm:absolute sm:top-1 sm:left-0 sm:mb-0 sm:w-[8.5rem] sm:pl-0">
        <time dateTime={publishedAt}>
          {formatDiaryDate(publishedAt.slice(0, 10))}
          {time && <span className="ml-3 opacity-60 sm:ml-0 sm:mt-1 sm:block">{time}</span>}
        </time>
      </p>
    </>
  );
}

/** A forma muda com o que foi registrado; o registro nunca ganha um rótulo. */
function PostBody({ post }: { post: Post }) {
  // HTML entregue pelo adaptador (Markdown hoje, Strapi amanhã) — conteúdo autoral.
  const body = (variant = "") => (
    <div className={`entry-body ${variant}`} dangerouslySetInnerHTML={{ __html: post.html }} />
  );
  const title = post.title && (
    <h3 className="mb-3 text-2xl leading-tight tracking-tight sm:text-[1.9rem]">{post.title}</h3>
  );

  switch (post.kind) {
    case "text":
      // Sem título, o próprio texto é o registro e ganha mais presença.
      return (
        <article>
          {title}
          {body(post.title ? "" : "entry-body--lead")}
        </article>
      );

    case "code":
      return (
        <article>
          {title}
          {body()}
        </article>
      );

    case "chord":
      return (
        <article>
          {title}
          <p className="mb-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className="text-[2.75rem] leading-none font-light italic">{post.chord.name}</span>
            {post.chord.shape && (
              <span className="font-mono text-xs tracking-[0.3em] text-muted">{post.chord.shape}</span>
            )}
          </p>
          {body()}
        </article>
      );

    case "photo":
      return (
        <figure>
          {title}
          <SubmergedPhoto
            src={post.image.publicId}
            alt={post.image.alt}
            sizes="(min-width: 640px) 28rem, 90vw"
            className="relative block aspect-4/3 w-full max-w-md mask-radial-from-40% mask-radial-to-75% [--photo-strength:2]"
          />
          {post.html && <figcaption className="mt-2">{body("entry-body--caption")}</figcaption>}
        </figure>
      );
  }
}
