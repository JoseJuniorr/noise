# noise.

Site pessoal de José Junior: um fluxo contínuo de registros — textos, código, acordes, fotos.

| Pasta | O que é |
| --- | --- |
| `src/` | Site em Next.js 16 (App Router, Cache Components) |
| `cms/` | Strapi 5, onde os registros são escritos |
| `content/posts/` | Registros em Markdown (fonte alternativa, sem CMS) |

## Como os dados fluem

A Home só conhece `getAllPosts()` ([src/infrastructure/posts.ts](src/infrastructure/posts.ts)). Por trás dela, um adaptador implementa `PostRepository`:

- `CONTENT_SOURCE=markdown` (padrão) — lê `content/posts/*.md`.
- `CONTENT_SOURCE=strapi` — lê a API REST do Strapi com um token só de leitura.

O fluxo fica em cache (tag `posts`). Ao publicar, editar ou apagar no Strapi, um webhook chama `POST /api/revalidate` e a próxima visita já traz a versão nova — sem rebuild.

Imagens: o Strapi envia os uploads para o Cloudinary; o site guarda só o `public_id` e o loader do `next/image` monta a URL.

## Desenvolvimento

```bash
cp .env.example .env.local   # CONTENT_SOURCE=markdown já funciona sem CMS
npm install
npm run dev                  # http://localhost:3000
npm run test:run && npm run lint && npm run typecheck
```

O Strapi local precisa de um Postgres (ex.: `docker run -e POSTGRES_USER=strapi -e POSTGRES_PASSWORD=strapi -e POSTGRES_DB=strapi -p 5432:5432 postgres:17-alpine`):

```bash
cd cms
cp .env.example .env         # preencha segredos e Cloudinary
npm install
npm run dev                  # painel em http://localhost:1337/admin
```

## Deploy no droplet (Docker)

Pré-requisitos: Docker com o plugin Compose, e dois registros DNS (A) apontando para o droplet — um para o site, outro para o painel.

1. **Variáveis.** No servidor, na raiz do repositório:
   ```bash
   cp .env.example .env
   ```
   Preencha `SITE_DOMAIN`, `CMS_DOMAIN` e as chaves do Cloudinary. Os segredos (`POSTGRES_PASSWORD`, os do Strapi e `REVALIDATE_SECRET`) são gerados por script, que só preenche o que estiver vazio:
   ```bash
   npm run secrets   # ou, sem Node no servidor: docker run --rm -v "$PWD":/app -w /app node:24-alpine node scripts/generate-secrets.mjs
   ```
   Deixe `STRAPI_API_TOKEN` vazio por enquanto.

2. **Primeira subida.**
   ```bash
   docker compose up -d --build
   ```
   O Caddy emite os certificados HTTPS sozinho. Abra `https://CMS_DOMAIN/admin` e crie a conta de administrador.

3. **Token de leitura.** No painel: *Settings → API Tokens → Create new API Token*, tipo **Read-only**, duração **Unlimited**. Copie o token para `STRAPI_API_TOKEN` no `.env` e recrie o site:
   ```bash
   docker compose up -d web
   ```

4. **Webhook.** No painel: *Settings → Webhooks → Create new webhook*:
   - URL: `http://web:3000/api/revalidate` (rede interna do compose)
   - Header: `x-revalidate-secret` = o mesmo valor de `REVALIDATE_SECRET`
   - Eventos: todos de **Entry** (create, update, delete, publish, unpublish)

5. **Escrever.** *Content Manager → Registro*. Campos por forma:
   - texto: `body` (Markdown), `title` opcional
   - código: o trecho em um bloco ```` ``` ```` dentro de `body`
   - acorde: `chordName` (obrigatório), `chordShape`, `body` opcional
   - foto: `image` com **Alternative text** preenchido, `body` vira legenda

   `writtenAt` é o momento do registro (mostrado no fuso `America/Sao_Paulo`; mude com `CONTENT_TIME_ZONE`). Só registros **publicados** aparecem no site; um registro incompleto fica de fora, com aviso no log do container `web`.

**Atualizar:** `git pull && docker compose up -d --build`.
**Backup:** o banco vive no volume `postgres-data` — `docker compose exec postgres pg_dump -U strapi strapi > backup.sql`. As imagens já estão no Cloudinary.
