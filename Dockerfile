FROM mcr.microsoft.com/playwright:v1.35.1-jammy as base

FROM base as builder
ENV CI=true
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm i
COPY . .
RUN pnpm build

FROM base
RUN env
ENV CI=true
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --prod
COPY --from=builder /app/dist/ ./dist/
CMD ["pnpm", "start"]
