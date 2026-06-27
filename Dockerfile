# Internal Docker image for the Privacy-First API
FROM node:22-alpine

WORKDIR /app

# Copy package metadata first for better Docker layer caching
COPY package*.json ./

# For this TypeScript runtime setup we intentionally install dev dependencies too,
# because server.ts is started via ts-node.
RUN npm install

# Copy TypeScript sources and config
COPY tsconfig.json ./
COPY server.ts ./
COPY privacy-utils.ts ./
COPY master-agent.ts ./
COPY council-engine.ts ./
COPY agent-response.ts ./
COPY decision-log.ts ./
COPY real-llm.ts ./

# Optional documentation / example config inside image
COPY .env.example ./

ENV NODE_ENV=production
ENV PORT=7071

EXPOSE 7071

CMD ["npx", "ts-node", "--project", "tsconfig.json", "server.ts"]
