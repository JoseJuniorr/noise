import "server-only";

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

export function leavePassage(slug: string): Promise<number> {
  return getRepository().add(slug);
}
