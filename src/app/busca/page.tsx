import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Tag } from "@/core/domain/post";
import { searchPosts } from "@/core/use-cases/search-posts";
import { getAllPosts } from "@/infrastructure/posts";
import { Backdrop } from "@/presentation/components/backdrop";
import { AFTER_THREAD, PostBody, PostMoment, THREAD_X, postHref } from "@/presentation/components/post";
import { tagHref } from "@/presentation/components/post-tags";
import { SiteFrame } from "@/presentation/components/site-frame";

export const metadata: Metadata = {
  title: "busca",
  description: "Procurar nos registros do noise.: textos, discos, acordes, cotidiano.",
  robots: { index: false, follow: true },
};

/** Busca no fluxo, por palavras ou por tag. A moldura é estática; os resultados dependem da URL. */
export default function SearchPage({ searchParams }: PageProps<"/busca">) {
  return (
    <>
      <Backdrop strength={0.35} />
      <SiteFrame>
        <main className="relative flex-1 flow-root pt-[12svh] pb-24">
          <span
            aria-hidden
            className={`absolute inset-y-0 ${THREAD_X} w-px bg-linear-to-b from-transparent via-signal/40 to-transparent`}
          />
          <Suspense fallback={<SearchForm />}>
            <Results searchParams={searchParams} />
          </Suspense>
        </main>
      </SiteFrame>
    </>
  );
}

function SearchForm({ text = "" }: { text?: string }) {
  return (
    <form action="/busca" role="search" className={`${AFTER_THREAD} mb-16`}>
      <label htmlFor="q" className="mb-3 block font-mono text-xs lowercase tracking-[0.14em] text-muted">
        buscar nos registros
      </label>
      <div className="flex max-w-xl items-baseline gap-4 border-b border-line focus-within:border-signal">
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={text}
          placeholder="uma palavra, um disco, um acorde…"
          className="w-full bg-transparent py-2 text-2xl font-light italic text-ink outline-none placeholder:text-muted/50"
        />
        <button type="submit" className="shrink-0 cursor-pointer whitespace-nowrap font-mono text-xs lowercase text-muted transition-colors hover:text-ink">
          buscar →
        </button>
      </div>
    </form>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/busca">, "searchParams">) {
  const params = await searchParams;
  const text = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const tag = typeof params.tag === "string" ? params.tag : undefined;

  const posts = await getAllPosts();
  const results = searchPosts(posts, { text, tag });
  const searched = Boolean(text.trim() || tag);
  const activeTag = tag && allTags(posts).find((t) => t.slug === tag);

  return (
    <>
      <SearchForm text={text} />

      {/* Os assuntos do caderno, para quem quer passear em vez de procurar. */}
      <nav aria-label="Assuntos" className={`${AFTER_THREAD} mb-16 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs lowercase text-muted`}>
        {allTags(posts).map((t) => (
          <Link
            key={t.slug}
            href={t.slug === tag ? "/busca" : tagHref(t.slug)}
            aria-current={t.slug === tag ? "true" : undefined}
            className={`transition-colors hover:text-ink ${t.slug === tag ? "text-ink" : ""}`}
          >
            <span className="text-signal/70">#</span>
            {t.name}
          </Link>
        ))}
      </nav>

      {searched && (
        <p aria-live="polite" className={`${AFTER_THREAD} mb-4 font-mono text-xs lowercase text-muted`}>
          {results.length === 0
            ? "nada encontrado. talvez com outras palavras."
            : `${results.length} ${results.length === 1 ? "registro" : "registros"}${activeTag ? ` em #${activeTag.name}` : ""}${text ? ` para “${text}”` : ""}`}
        </p>
      )}

      {searched && (
        <ol>
          {results.map((post) => (
            <li key={post.slug} className="group relative mt-14">
              <PostMoment publishedAt={post.publishedAt} href={postHref(post.slug)} />
              <div className={AFTER_THREAD}>
                <PostBody post={post} mode="feed" />
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

/** Todas as tags em uso, sem repetir, em ordem alfabética. */
function allTags(posts: readonly { tags: readonly Tag[] }[]): Tag[] {
  const bySlug = new Map<string, Tag>();
  for (const post of posts) for (const tag of post.tags) if (!bySlug.has(tag.slug)) bySlug.set(tag.slug, tag);
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
