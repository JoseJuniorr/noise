import "server-only";

import { cache } from "react";
import type { PassageRepository } from "@/core/ports/passage-repository";
import { InMemoryPassageRepository } from "./persistence/in-memory-passage-repository";
import { PostgresPassageRepository } from "./persistence/postgres/postgres-passage-repository";

/**
 * Raiz de composição das marcas "passei por aqui". Com PASSAGES_DATABASE_URL
 * (no droplet), grava no Postgres; sem ela (desenvolvimento), fica em memória.
 */
let repository: PassageRepository | undefined;

function getRepository(): PassageRepository {
  if (!repository) {
    const url = process.env.PASSAGES_DATABASE_URL;
    repository = url ? new PostgresPassageRepository(url) : new InMemoryPassageRepository();
  }
  return repository;
}

/**
 * Contagens para exibir. Uma falha no banco não derruba a página: as
 * marcas são um detalhe, os registros são o conteúdo.
 */
export async function getPassageCounts(slugs: readonly string[]): Promise<Record<string, number>> {
  try {
    return await getRepository().counts(slugs);
  } catch (error) {
    console.error("[noise] contagem de passagens indisponível —", (error as Error).message);
    return {};
  }
}

/** Quantos nomes recentes aparecem junto da contagem. */
export const RECENT_NAMES = 3;

export type PassageInfo = { count: number; names: string[] };

/**
 * Contagem e nomes recentes de um registro. Memorizado por requisição: a margem
 * e o fim do texto pedem a mesma coisa, mas o banco é consultado uma vez.
 */
export const getPassageInfo = cache(async (slug: string): Promise<PassageInfo> => {
  try {
    const [counts, names] = await Promise.all([
      getRepository().counts([slug]),
      getRepository().recentNames(slug, RECENT_NAMES),
    ]);
    return { count: counts[slug] ?? 0, names };
  } catch (error) {
    console.error("[noise] passagens indisponíveis —", (error as Error).message);
    return { count: 0, names: [] };
  }
});

export async function leavePassage(slug: string, name?: string): Promise<PassageInfo> {
  const count = await getRepository().add(slug, name);
  return { count, names: await getRepository().recentNames(slug, RECENT_NAMES) };
}
