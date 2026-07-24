FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/engine/package.json ./packages/engine/
COPY packages/schema/package.json ./packages/schema/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/
COPY . .
RUN pnpm run build --filter=@exsim/worker

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/packages/engine/dist ./packages/engine/dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "apps/worker/dist/index.js"]
