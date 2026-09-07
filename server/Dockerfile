# --- Stage 1: build frontend (client) ---
FROM node:22-slim AS client-build
WORKDIR /app
COPY client/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY client/ ./client/
RUN npm run build

# --- Stage 2: dependensi server ---
FROM node:22-slim AS deps
WORKDIR /app/server
COPY server/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# --- Stage 3: runtime ---
FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app/server
COPY --from=deps /app/server/node_modules ./node_modules
COPY --from=client-build /app/client/dist ../client/dist
COPY server/ ./

# Jangan ikut tertimpa saat container start; env mutation via compose/env vars.
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]