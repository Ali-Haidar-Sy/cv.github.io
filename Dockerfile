# ─── Multi-stage Dockerfile for CV Builder ───────────────────────────────────

FROM node:20-alpine AS backend

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

EXPOSE 3001

CMD ["node", "server.js"]
