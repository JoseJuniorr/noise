import { Pool } from "pg";
import type { PassageRepository } from "@/core/ports/passage-repository";

/**
 * Marcas no Postgres do droplet, num schema próprio (`noise`) para nunca
 * cruzar com as tabelas e migrações do Strapi, que vivem em `public`.
 */
export class PostgresPassageRepository implements PassageRepository {
  private readonly pool: Pool;
  private ready: Promise<void> | undefined;

  constructor(connectionString: string) {
    // Poucas conexões: o droplet tem 1 GB e o Strapi divide o mesmo banco.
    this.pool = new Pool({ connectionString, max: 3, idleTimeoutMillis: 30_000 });
  }

  async counts(slugs: readonly string[]): Promise<Record<string, number>> {
    if (slugs.length === 0) return {};
    await this.ensureSchema();
    const { rows } = await this.pool.query<{ slug: string; count: number }>(
      "select slug, count from noise.passages where slug = any($1::text[])",
      [slugs],
    );
    return Object.fromEntries(rows.map((row) => [row.slug, row.count]));
  }

  async add(slug: string): Promise<number> {
    await this.ensureSchema();
    const { rows } = await this.pool.query<{ count: number }>(
      `insert into noise.passages (slug, count) values ($1, 1)
       on conflict (slug) do update set count = noise.passages.count + 1, updated_at = now()
       returning count`,
      [slug],
    );
    return rows[0].count;
  }

  /** Cria o schema e a tabela na primeira vez; depois é só a promessa já resolvida. */
  private ensureSchema(): Promise<void> {
    this.ready ??= this.pool
      .query(
        `create schema if not exists noise;
         create table if not exists noise.passages (
           slug text primary key,
           count integer not null default 0,
           updated_at timestamptz not null default now()
         );`,
      )
      .then(() => undefined)
      .catch((error) => {
        this.ready = undefined; // tenta de novo na próxima chamada
        throw error;
      });
    return this.ready;
  }
}
