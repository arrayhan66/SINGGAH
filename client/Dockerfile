# --- Stage 1: build SPA ---
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

# API dipanggil same-origin -> nginx meneruskan /api ke service `api`.
ENV VITE_API_URL=/api
RUN npm run build

# --- Stage 2: web server ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]