# Build stage
FROM node:20.19-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:1.28-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

ARG NGINX_CONFIG=default.local.conf

# Copy nginx config for React Router support
COPY ${NGINX_CONFIG} /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]