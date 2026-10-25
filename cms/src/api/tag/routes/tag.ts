import { factories } from '@strapi/strapi';

// Só leitura pela API: tags se criam no painel.
export default factories.createCoreRouter('api::tag.tag', {
  only: ['find', 'findOne'],
});
