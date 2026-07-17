# Install production dependencies
FROM node:20.19-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Production stage
FROM node:20.19-alpine

WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]