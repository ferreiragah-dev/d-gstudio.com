# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --include=dev

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Apenas dados públicos são incorporados ao build do Next.js.
# Easypanel fornece estes valores como build arguments.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_WHATSAPP
ARG NEXT_PUBLIC_INSTAGRAM
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_CONTACT_EMAIL=${NEXT_PUBLIC_CONTACT_EMAIL} \
    NEXT_PUBLIC_WHATSAPP=${NEXT_PUBLIC_WHATSAPP} \
    NEXT_PUBLIC_INSTAGRAM=${NEXT_PUBLIC_INSTAGRAM} \
    NEXT_STANDALONE=true

RUN mkdir -p public && npm run build

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# QUOTE_WEBHOOK_URL e QUOTE_WEBHOOK_TOKEN são fornecidos somente em runtime.
USER node
EXPOSE 3000
CMD ["node", "server.js"]
