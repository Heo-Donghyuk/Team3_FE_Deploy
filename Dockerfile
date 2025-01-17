# Build stage
FROM krmp-d2hub-idock.9rum.cc/goorm/node:16 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /usr/src/app

# Install dependencies based on the preferred package manager
COPY /package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY / .
RUN npm run build

FROM base AS runner
WORKDIR /usr/src/app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static
# # 이미지 깨짐 오류
# COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next ./.next/_next
# COPY --from=builder /usr/src/app/next.config.js ./
# #COPY --from=builder /app/public ./public
# COPY --from=builder /usr/src/app/next.config.js ./next.config.js
# COPY --from=builder /usr/src/app/package.json ./package.json
# RUN chown -R nextjs:nodejs /usr/src/app/
# COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static
# COPY --from=builder /usr/src/app/node_modules/next/dist/compiled/jest-worker ./node_modules/next/dist/compiled/jest-worker

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

ENV NEXT_PUBLIC_API_URL https://ka02fa9a0d9a2a.user-app.krampoline.com
ENV NEXT_PUBLIC_KAKAOMAP_APPKEY 3b5893ebb985d9c035b14cc31922553f

CMD ["node", "server.js"]
# CMD ["npm", "run", "start"]
