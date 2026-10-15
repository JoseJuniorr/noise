#!/usr/bin/env node
/**
 * Preenche os segredos vazios do .env (padrão: o da raiz, lido pelo docker-compose).
 * Nunca sobrescreve um valor existente e nunca imprime os segredos — só os nomes.
 *
 *   node scripts/generate-secrets.mjs            # .env da raiz
 *   node scripts/generate-secrets.mjs cms/.env   # outro arquivo
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// base64url: sem "+", "/" ou "=", então nada precisa de aspas no .env nem no Postgres.
const secret = () => randomBytes(32).toString("base64url");

const GENERATORS = {
  POSTGRES_PASSWORD: secret,
  // O Strapi espera vários segredos para APP_KEYS, separados por vírgula.
  APP_KEYS: () => Array.from({ length: 4 }, secret).join(","),
  API_TOKEN_SALT: secret,
  ADMIN_JWT_SECRET: secret,
  TRANSFER_TOKEN_SALT: secret,
  JWT_SECRET: secret,
  ENCRYPTION_KEY: secret,
  REVALIDATE_SECRET: secret,
};

const file = process.argv[2] ?? ".env";
if (!existsSync(file)) {
  console.error(`${file} não existe — copie o .env.example primeiro.`);
  process.exit(1);
}

const lines = readFileSync(file, "utf8").split(/\r?\n/);
const filled = [];
const kept = [];

for (const [name, generate] of Object.entries(GENERATORS)) {
  const index = lines.findIndex((line) => line.startsWith(`${name}=`));
  const current = index === -1 ? "" : lines[index].slice(name.length + 1).trim().replace(/^["']|["']$/g, "");

  if (current) {
    kept.push(name);
    continue;
  }
  if (index === -1) lines.push(`${name}=${generate()}`);
  else lines[index] = `${name}=${generate()}`;
  filled.push(name);
}

writeFileSync(file, lines.join("\n"));
console.log(`${file}`);
console.log(`  gerados:  ${filled.join(", ") || "(nenhum)"}`);
console.log(`  mantidos: ${kept.join(", ") || "(nenhum)"}`);
