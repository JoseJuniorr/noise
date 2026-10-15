import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Endereço público (ex.: https://cms.seudominio.com): o painel monta links e redirecionamentos com ele.
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  // Atrás do Caddy, confia nos cabeçalhos X-Forwarded-* para saber que a conexão é HTTPS.
  proxy: { koa: env.bool('IS_PROXIED', false) },
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

export default config;
