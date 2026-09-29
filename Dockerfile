# Image produksi Next.js (output: "standalone"), multi-stage.
ARG NODE_VERSION=24

# ---- base ----
FROM node:${NODE_VERSION}-alpine AS base
# libc6-compat dibutuhkan beberapa binary native (mis. sharp) di Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- deps: install dependensi (di-cache selama package-lock.json tidak berubah) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- builder: build aplikasi ----
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Catatan: next/font/google mengunduh font saat build, jadi build butuh akses internet.
RUN npm run build

# ---- runner: image akhir, hanya file yang dibutuhkan untuk berjalan ----
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
