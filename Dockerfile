# FILE: /home/ipacx/ipacx-ris-v3/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy application source code
COPY . .

# Expose API Port
EXPOSE 5003

# Environment Defaults
ENV NODE_ENV=production
ENV PORT=5003

# Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5003/health || exit 1

# Start v3 Server
CMD ["node", "backend/server.js"]
