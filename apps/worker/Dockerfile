FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml .npmrc tsconfig.base.json turbo.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/engine/package.json ./packages/engine/
COPY packages/schema/package.json ./packages/schema/

RUN pnpm install --frozen-lockfile

COPY packages/engine/ ./packages/engine/
COPY packages/schema/ ./packages/schema/
COPY apps/worker/ ./apps/worker/

RUN pnpm turbo run build --filter=@exsim/worker

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/pnpm-lock.yaml /app/package.json /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/packages/engine/package.json ./packages/engine/
COPY --from=builder /app/packages/schema/package.json ./packages/schema/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/packages/engine/dist ./packages/engine/dist
COPY --from=builder /app/packages/schema/dist ./packages/schema/dist

CMD ["node", "apps/worker/dist/index.js"]
