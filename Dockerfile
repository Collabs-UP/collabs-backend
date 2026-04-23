FROM node:22-alpine AS base
WORKDIR /app
ENV DATABASE_URL postgresql://postgres:postgres@localhost:5432/collabs?schema=public

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/main"]
