# Internal Docker image for the Privacy-First API
FROM node:22-alpine

WORKDIR /app

# Copy package metadata first for better Docker layer caching
COPY package*.json ./

# The API runs TypeScript via ts-node, so dev dependencies are required.
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

# Phase 6 agent routing / council metadata modules
COPY agent-capabilities.ts ./
COPY agent-routing-details.ts ./
COPY council-routing-metadata.ts ./
COPY council-routing-response-types.ts ./
COPY knowledge-base.ts ./
COPY knowledge-routing-context.ts ./
COPY project-memory.ts ./
COPY project-memory-context.ts ./
COPY web-research.ts ./
COPY web-research-summary.ts ./
COPY tool-preflight-debug.ts ./
COPY tool-enforcement-prep.ts ./
COPY tool-consent-agent-flow.ts ./
COPY memory ./memory
COPY knowledge-quality.ts ./
COPY knowledge ./knowledge

# Optional documentation / example config inside image
COPY .env.example ./

ENV NODE_ENV=production
ENV PORT=7071

EXPOSE 7071

CMD ["npx", "ts-node", "--project", "tsconfig.json", "server.ts"]
