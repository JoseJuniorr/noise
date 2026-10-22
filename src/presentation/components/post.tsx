import Link from "next/link";
import type { Post } from "@/core/domain/post";
import { formatDiaryDate } from "@/presentation/format/diary-date";
import { splitLead } from "@/presentation/format/lead";
import { passageLabel } from "@/presentation/format/passages";
import { PostImage } from "./post-image";

/*
 * O fio: uma linha vertical que atravessa todos os registros.
 * No celular corre na borda esquerda; a partir de `sm` vira a margem do caderno.
 */
export const THREAD_X = "left-0 sm:left-[10rem]";
export const AFTER_THREAD = "pl-6 sm:pl-[11.5rem]";

/** Endereço permanente de um registro. */
export const postHref = (slug: string) => `/registros/${slug}`;

/** Data e hora de um registro como texto (para links e títulos sem título). */
export function postMomentLabel(publishedAt: string): string {
  const time = publishedAt.slice(11, 16);
  return `${formatDiaryDate(publishedAt.slice(0, 10))}${time ? ` · ${time}` : ""}`;
}

/**
 * Data (e hora, quando houver) na margem, com um ponto sobre o fio marcando
 * o instante. Com `href`, a data é o link permanente do registro — como num diário.
 */
export function PostMoment({
  publishedAt,
  href,
  passages = 0,
  aside,
}: {
  publishedAt: string;
  href?: string;
  /** Marcas "passei por aqui" — aparecem só quando existem. */
  passages?: number;
  /** Algo a mais na margem, sob a data (na página do registro: o gesto "passei por aqui"). */
  aside?: React.ReactNode;
}) {
  const time = publishedAt.slice(11, 16);
  const moment = (
    <time dateTime={publishedAt}>
      {formatDiaryDate(publishedAt.slice(0, 10))}
      {time && <span className="ml-3 opacity-60 sm:mt-1 sm:ml-0 sm:block">{time}</span>}
    </time>
  );

  return (
    <>
      <span
        aria-hidden
        className="absolute top-2.5 left-0 size-[5px] -translate-x-[2px] bg-muted transition-colors duration-700 group-hover:bg-signal sm:left-[10rem]"
      />
      <div className="mb-3 pl-6 font-mono text-xs text-muted sm:absolute sm:top-1 sm:left-0 sm:mb-0 sm:w-[8.5rem] sm:pl-0">
        {href ? (
          <Link href={href} className="transition-colors hover:text-ink">
            {moment}
          </Link>
        ) : (
          moment
        )}
        {passages > 0 && (
          <span title={passageLabel(passages)} className="ml-3 opacity-60 sm:mt-1 sm:ml-0 sm:block">
            <span aria-hidden className="text-signal/70">
              ◼
            </span>{" "}
            <span aria-hidden>{passages}</span>
            <span className="sr-only">{passageLabel(passages)}</span>
          </span>
        )}
        {aside && <div className="mt-3 sm:mt-6">{aside}</div>}
      </div>
    </>
  );
}

type PostBodyProps = {
  post: Post;
  /** "feed": no fluxo, textos com título mostram só a abertura. "full": o registro inteiro. */
  mode: "feed" | "full";
};

/** A forma muda com o que foi registrado; o registro nunca ganha um rótulo. */
export function PostBody({ post, mode }: PostBodyProps) {
  const href = postHref(post.slug);
  const inFeed = mode === "feed";

  // No fluxo, um texto com título é um texto longo: aparece a abertura e o convite para continuar.
  const { lead, hasMore } =
    inFeed && post.kind === "text" && post.title ? splitLead(post.html) : { lead: post.html, hasMore: false };

  // HTML entregue pelo adaptador (Markdown hoje, Strapi amanhã) — conteúdo autoral.
  const body = (variant = "") => (
    <div className={`entry-body ${variant}`} dangerouslySetInnerHTML={{ __html: lead }} />
  );

  const Heading = inFeed ? "h3" : "h1";
  const title = post.title && (
    <Heading
      className={
        inFeed
          ? "mb-3 text-2xl leading-tight tracking-tight sm:text-[1.9rem]"
          : "mb-8 text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] font-light tracking-[-0.02em] text-balance"
      }
    >
      {inFeed ? (
        <Link href={href} className="transition-colors hover:text-signal">
          {post.title}
        </Link>
      ) : (
        post.title
      )}
    </Heading>
  );

  const more = hasMore && (
    <Link
      href={href}
      className="mt-4 inline-block font-mono text-xs lowercase tracking-[0.2em] text-muted transition-colors hover:text-signal"
    >
      continuar →
    </Link>
  );

  // Fora do fluxo, o texto respira mais: corpo maior, sem o cinza de resumo.
  const fullBody = inFeed ? "" : "entry-body--full";

  // Imagem que acompanha um texto, um código ou um acorde: entra sob o título, sem tomar o lugar dele.
  const cover = post.kind !== "photo" && post.image && (
    <div className={inFeed ? "mb-5" : "mb-10"}>
      <PostImage image={post.image} role="cover" mode={mode} />
    </div>
  );

  switch (post.kind) {
    case "text":
      // Sem título, o próprio texto é o registro e ganha mais presença.
      return (
        <article>
          {title}
          {cover}
          {body(post.title ? fullBody : "entry-body--lead")}
          {more}
        </article>
      );

    case "code":
      return (
        <article>
          {title}
          {cover}
          {body(fullBody)}
        </article>
      );

    case "chord":
      return (
        <article>
          {title}
          {cover}
          <p className="mb-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className={`${inFeed ? "text-[2.75rem]" : "text-[4rem]"} leading-none font-light italic`}>
              {post.chord.name}
            </span>
            {post.chord.shape && (
              <span className="font-mono text-xs tracking-[0.3em] text-muted">{post.chord.shape}</span>
            )}
          </p>
          {body(fullBody)}
        </article>
      );

    case "photo":
      return (
        <figure>
          {title}
          <PostImage image={post.image} role="photo" mode={mode} />
          {post.html && <figcaption className="mt-2">{body("entry-body--caption")}</figcaption>}
        </figure>
      );
  }
}
