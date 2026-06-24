# Minimaler Container für die Privacy-First API
FROM node:22-alpine

WORKDIR /app

# Nur Pakete kopieren, damit npm install gecacht werden kann
COPY package*.json ./

# Produktionsabhängigkeiten installieren
RUN npm install --omit=dev

# TypeScript-Quellen und Konfiguration kopieren
COPY tsconfig.json ./
COPY server.ts ./
COPY privacy-utils.ts ./
COPY master-agent.ts ./
COPY council-engine.ts ./
COPY agent-response.ts ./
COPY decision-log.ts ./
COPY real-llm.ts ./

# Optional: Dokumentation / Beispielkonfiguration
COPY .env.example ./

ENV NODE_ENV=production
ENV PORT=7071

EXPOSE 7071

CMD ["npx", "ts-node", "--project", "tsconfig.json", "server.ts"]
