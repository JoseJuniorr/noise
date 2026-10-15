import { factories } from '@strapi/strapi';

// Só leitura pela API: escrever é pelo painel.
export default factories.createCoreRouter('api::post.post', {
  only: ['find', 'findOne'],
});
