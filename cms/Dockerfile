# Strapi 5 do noise. — build do painel e execução em produção.
FROM node:24-alpine AS build
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Em droplet de 1 GB o Node limita o heap pela RAM livre; com o swap, 2 GB é seguro.
ENV NODE_ENV=production NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /opt/app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /opt/app ./
USER node
EXPOSE 1337
CMD ["npm", "run", "start"]
