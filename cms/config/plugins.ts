import type { Core } from '@strapi/strapi';

// O noise. só publica imagens; o resto fica de fora do upload.
const allowedMediaTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      // Os arquivos vão direto para o Cloudinary; o site guarda só o public_id e monta a URL.
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: { folder: env('CLOUDINARY_FOLDER', 'noise') },
        uploadStream: { folder: env('CLOUDINARY_FOLDER', 'noise') },
        delete: {},
      },
      security: {
        allowedTypes: allowedMediaTypes,
      },
    },
  },
});

export default config;
