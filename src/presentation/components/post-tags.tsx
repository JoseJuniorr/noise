import Link from "next/link";
import type { Tag } from "@/core/domain/post";

export const tagHref = (slug: string) => `/busca?tag=${encodeURIComponent(slug)}`;

/** Os assuntos de um registro, discretos, cada um levando aos outros registros com ele. */
export function PostTags({ tags }: { tags: readonly Tag[] }) {
  if (tags.length === 0) return null;
  return (
    <ul aria-label="Assuntos" className="mt-10 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs lowercase text-muted">
      {tags.map((tag) => (
        <li key={tag.slug}>
          <Link href={tagHref(tag.slug)} className="transition-colors hover:text-ink">
            <span className="text-signal/70">#</span>
            {tag.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
