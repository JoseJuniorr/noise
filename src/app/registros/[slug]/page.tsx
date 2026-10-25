import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { site } from "@/config/site";
import { isAdmin } from "@/infrastructure/admin/admin";
import { getPassageInfo } from "@/infrastructure/passages";
import { getAllPosts, getPostBySlug } from "@/infrastructure/posts";
import { Backdrop } from "@/presentation/components/backdrop";
import { PassageForm } from "@/presentation/components/passage/passage-form";
import { PassageSummary } from "@/presentation/components/passage/passage-summary";
import { PostTags } from "@/presentation/components/post-tags";
import { logout } from "@/app/entrar/actions";
import { ShareArt } from "@/presentation/components/share-art";
import { ShareLink } from "@/presentation/components/share-link";
import {
  AFTER_THREAD,
  PostBody,
  PostMoment,
  THREAD_X,
  postHref,
  postMomentLabel,
} from "@/presentation/components/post";
import { SiteFrame } from "@/presentation/components/site-frame";
import { toPlainText } from "@/presentation/format/lead";

export async function generateMetadata({ params }: PageProps<"/registros/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "registro não encontrado" };

  const description = post.summary ?? (toPlainText(post.html) || site.motto);
  return {
    title: post.title ?? postMomentLabel(post.publishedAt),
    description,
    alternates: { canonical: postHref(post.slug) },
    openGraph: {
      type: "article",
      url: postHref(post.slug),
      siteName: `${site.name}.`,
      publishedTime: post.publishedAt,
      description,
    },
    // A imagem de prévia é a arte do registro (opengraph-image.tsx ao lado).
    twitter: { card: "summary_large_image" },
  };
}

/**
 * Um registro sozinho. Renderizado sob demanda e guardado em cache: funciona
 * para registros criados no CMS depois do build, sem gerar a lista no build.
 */
export default function PostPage({ params }: PageProps<"/registros/[slug]">) {
  return (
    <>
      {/* Aqui se lê: a foto fica mais funda para não disputar com o texto. */}
      <Backdrop strength={0.45} />

      <SiteFrame>
        <main className="relative flex-1 flow-root pt-[14svh] pb-24">
          <span
            aria-hidden
            className={`absolute inset-y-0 ${THREAD_X} w-px bg-linear-to-b from-transparent via-signal/40 to-transparent`}
          />
          {/* O endereço só é lido aqui dentro, para a moldura da página servir a qualquer registro. */}
          <Suspense fallback={null}>
            <PostEntry params={params} />
          </Suspense>
        </main>
      </SiteFrame>
    </>
  );
}

async function PostEntry({ params }: Pick<PageProps<"/registros/[slug]">, "params">) {
  const { slug } = await params;
  // O fluxo inteiro já está em cache e dá, de uma vez, o registro e os vizinhos.
  const posts = await getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) notFound();

  const post = posts[index];
  const newer = posts[index - 1];
  const older = posts[index + 1];

  return (
    <>
      <div className="group relative">
        <PostMoment
          publishedAt={post.publishedAt}
          aside={
            // Sob a data: quantos passaram e um atalho até o convite no fim do texto.
            // A contagem muda a cada visita; o texto ao lado segue em cache.
            <div className="space-y-5">
              <Suspense fallback={null}>
                <Passages slug={post.slug} />
              </Suspense>
              <ShareLink title={post.title ?? postMomentLabel(post.publishedAt)} path={postHref(post.slug)} />
              {/* Ferramentas de arte: só para o administrador, lidas do cookie no acesso. */}
              <Suspense fallback={null}>
                <AdminTools
                  slug={post.slug}
                  title={post.title ?? postMomentLabel(post.publishedAt)}
                  path={postHref(post.slug)}
                />
              </Suspense>
            </div>
          }
        />
        <div className={AFTER_THREAD}>
          <PostBody post={post} mode="full" />
          <PostTags tags={post.tags} />
          <Suspense fallback={null}>
            <PassageInvite slug={post.slug} />
          </Suspense>
        </div>
      </div>

      {/* Continuar pelo fluxo: para trás no tempo, para frente, ou de volta ao começo. */}
      <nav
        aria-label="Fluxo de registros"
        className={`${AFTER_THREAD} mt-28 grid gap-6 font-mono text-xs lowercase tracking-[0.15em] text-muted sm:grid-cols-3`}
      >
        <div>{older && <FlowLink post={older} direction="older" />}</div>
        <Link href={`/#${post.slug}`} className="transition-colors hover:text-ink sm:text-center">
          ← {site.name}
          <span className="text-signal">.</span>
        </Link>
        <div className="sm:text-right">{newer && <FlowLink post={newer} direction="newer" />}</div>
      </nav>
    </>
  );
}

/** "Passei por aqui" — a contagem é lida no acesso, fora do cache do registro. */
async function Passages({ slug }: { slug: string }) {
  await connection();
  const { count, names } = await getPassageInfo(slug);
  return <PassageSummary slug={slug} initialCount={count} initialNames={names} />;
}

/** O convite no fim do texto: depois de ler, o lugar natural para deixar uma marca. */
async function PassageInvite({ slug }: { slug: string }) {
  await connection();
  const { count, names } = await getPassageInfo(slug);
  return <PassageForm slug={slug} initialCount={count} initialNames={names} />;
}

async function AdminTools(props: { slug: string; title: string; path: string }) {
  if (!(await isAdmin())) return null;
  return (
    <div className="space-y-3">
      <ShareArt {...props} />
      <form action={logout}>
        <button type="submit" className="cursor-pointer font-mono text-xs lowercase text-muted/60 transition-colors hover:text-ink">
          sair
        </button>
      </form>
    </div>
  );
}

function FlowLink({
  post,
  direction,
}: {
  post: { slug: string; title?: string; publishedAt: string };
  direction: "older" | "newer";
}) {
  return (
    <Link href={postHref(post.slug)} className="group/flow block transition-colors hover:text-ink">
      <span className="block opacity-60">{direction === "older" ? "← antes" : "depois →"}</span>
      <span className="mt-1 block normal-case tracking-normal font-serif text-base italic group-hover/flow:text-signal">
        {post.title ?? postMomentLabel(post.publishedAt)}
      </span>
    </Link>
  );
}
