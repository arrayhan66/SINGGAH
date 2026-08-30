# --- Stage 1: dependensi (dipisah agar layer cache optimal) ---
FROM node:22-slim AS deps
WORKDIR /app

# Konflik peer yang sudah diketahui (multer-storage-cloudinary vs cloudinary).
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# --- Stage 2: runtime ---
FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY . .

# Jangan ikut tertimpa saat container start; env mutation via compose/env vars.
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]