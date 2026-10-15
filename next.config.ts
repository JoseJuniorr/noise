import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Servidor mínimo (.next/standalone) para a imagem Docker do droplet.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Imagens servidas pelo Cloudinary (`src` = public_id); caminhos "/…" de public/ passam direto.
    loader: "custom",
    loaderFile: "./src/infrastructure/images/cloudinary-loader.ts",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
