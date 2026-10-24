import type { Metadata } from "next";
import { about, type AboutLink } from "@/config/about";
import { site } from "@/config/site";
import { Backdrop } from "@/presentation/components/backdrop";
import { AFTER_THREAD, THREAD_X } from "@/presentation/components/post";
import { SiteFrame } from "@/presentation/components/site-frame";

export const metadata: Metadata = {
  title: "sobre",
  description: `${site.author} — engenheiro de software e músico. Projetos, escritos e onde mais me encontrar.`,
  alternates: { canonical: "/sobre" },
};

/** Quem escreve o noise., os projetos e onde mais encontrar — com a mesma margem de caderno dos registros. */
export default function AboutPage() {
  const writing = about.writing.filter((link) => link.href);

  return (
    <>
      <Backdrop strength={0.35} />

      <SiteFrame>
        <main className="relative flex-1 flow-root pt-[14svh] pb-24">
          <span
            aria-hidden
            className={`absolute inset-y-0 ${THREAD_X} w-px bg-linear-to-b from-transparent via-signal/40 to-transparent`}
          />

          <Section label="quem escreve">
            <h1 className="mb-8 text-[clamp(2.5rem,5.5vw,4rem)] leading-none font-extralight italic tracking-[-0.03em] text-ink/90">
              {site.author}
            </h1>
            <div className="entry-body entry-body--full space-y-5">
              {about.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Section>

          <Section label="projetos">
            <ul className="space-y-14">
              {about.projects.map((project) => (
                <li key={project.name}>
                  <h2 className="text-2xl leading-tight tracking-tight sm:text-[1.9rem]">{project.name}</h2>
                  <p className="mt-1 italic text-muted">{project.summary}</p>
                  <p className="entry-body mt-4">{project.story}</p>
                  {project.stack && (
                    <p className="mt-4 font-mono text-[0.7rem] lowercase tracking-[0.15em] text-muted/70">
                      {project.stack.join(" · ")}
                    </p>
                  )}
                  <LinkRow links={project.links} />
                </li>
              ))}
            </ul>
          </Section>

          {writing.length > 0 && (
            <Section label="escritos">
              <LinkRow links={writing} large />
            </Section>
          )}

          <Section label="como trabalho">
            {/* Os princípios lidos como escolhas: o da esquerda vem antes do da direita. */}
            <dl className="grid max-w-md grid-cols-[auto_auto_1fr] gap-x-4 gap-y-2 font-mono text-sm">
              {about.principles.map(([first, over]) => (
                <div key={first} className="contents">
                  <dt className="text-ink/90">{first}</dt>
                  <dd className="text-signal/80">
                    <span aria-hidden>&gt;</span>
                    <span className="sr-only">antes de</span>
                  </dd>
                  <dd className="text-muted">{over}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section label="em outros lugares">
            <LinkRow links={about.elsewhere} />
          </Section>
        </main>
      </SiteFrame>
    </>
  );
}

/** Uma seção do caderno: rótulo na margem, um ponto sobre o fio, conteúdo ao lado. */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section aria-label={label} className="relative mb-24 last:mb-0">
      <span aria-hidden className="absolute top-2.5 left-0 size-[5px] -translate-x-[2px] bg-muted sm:left-[10rem]" />
      <p className="mb-4 pl-6 font-mono text-xs lowercase text-muted sm:absolute sm:top-1 sm:left-0 sm:mb-0 sm:w-[8.5rem] sm:pl-0">
        {label}
      </p>
      <div className={AFTER_THREAD}>{children}</div>
    </section>
  );
}

function LinkRow({ links, large = false }: { links: AboutLink[]; large?: boolean }) {
  return (
    <ul
      className={`mt-5 flex flex-wrap gap-x-6 gap-y-2 ${large ? "font-serif text-xl italic" : "font-mono text-xs lowercase tracking-[0.12em]"} text-muted`}
    >
      {links
        .filter((link) => link.href)
        .map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link transition-colors hover:text-ink"
            >
              {link.label} <span className="transition-colors group-hover/link:text-signal">↗</span>
            </a>
          </li>
        ))}
    </ul>
  );
}
