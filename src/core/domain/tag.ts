import type { Tag } from "./post";

/** "Música ao vivo" → "musica-ao-vivo": o endereço de uma tag a partir do nome. */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Lista de nomes (com repetições, espaços, vazios) → tags únicas, na ordem em que vieram. */
export function toTags(names: readonly string[]): Tag[] {
  const seen = new Set<string>();
  return names.flatMap((raw) => {
    const name = raw.trim();
    const slug = slugify(name);
    if (!slug || seen.has(slug)) return [];
    seen.add(slug);
    return [{ name, slug }];
  });
}

/** "rock, Ao vivo , ,rock" → ["rock", "Ao vivo"]: palavras-chave separadas por vírgula. */
export function splitList(value: string | readonly string[] | null | undefined): string[] {
  const items = typeof value === "string" ? value.split(",") : [...(value ?? [])];
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];
}
