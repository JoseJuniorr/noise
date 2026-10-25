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

  async add(slug: string, name?: string): Promise<number> {
    await this.ensureSchema();
    const client = await this.pool.connect();
    try {
      // Contagem e nome juntos: ou entram os dois, ou nenhum.
      await client.query("begin");
      const { rows } = await client.query<{ count: number }>(
        `insert into noise.passages (slug, count) values ($1, 1)
         on conflict (slug) do update set count = noise.passages.count + 1, updated_at = now()
         returning count`,
        [slug],
      );
      if (name) await client.query("insert into noise.passage_names (slug, name) values ($1, $2)", [slug, name]);
      await client.query("commit");
      return rows[0].count;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async recentNames(slug: string, limit: number): Promise<string[]> {
    await this.ensureSchema();
    const { rows } = await this.pool.query<{ name: string }>(
      "select name from noise.passage_names where slug = $1 order by created_at desc, id desc limit $2",
      [slug, limit],
    );
    return rows.map((row) => row.name);
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
         );
         create table if not exists noise.passage_names (
           id bigserial primary key,
           slug text not null,
           name text not null,
           created_at timestamptz not null default now()
         );
         create index if not exists passage_names_slug_idx on noise.passage_names (slug, created_at desc);`,
      )
      .then(() => undefined)
      .catch((error) => {
        this.ready = undefined; // tenta de novo na próxima chamada
        throw error;
      });
    return this.ready;
  }
}
