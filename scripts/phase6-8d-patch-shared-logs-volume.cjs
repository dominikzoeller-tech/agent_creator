const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "docker-compose.internal.yml");
if (!fs.existsSync(file)) {
  console.error("docker-compose.internal.yml wurde im Projekt-Root nicht gefunden.");
  process.exit(1);
}

let content = fs.readFileSync(file, "utf8");
const original = content;

function ensureVolumeBlockForService(serviceName, volumeLine) {
  const serviceRegex = new RegExp(`(  ${serviceName}:\\n[\\s\\S]*?)(?=\\n  [a-zA-Z0-9_-]+:|\\n?$)`, "m");
  const match = content.match(serviceRegex);
  if (!match) {
    console.error(`Service ${serviceName} wurde in docker-compose.internal.yml nicht gefunden.`);
    process.exit(1);
  }

  let block = match[1];
  if (block.includes(volumeLine)) {
    return;
  }

  if (block.includes("\n    volumes:\n")) {
    block = block.replace("\n    volumes:\n", `\n    volumes:\n      - ${volumeLine}\n`);
  } else {
    const portsIndex = block.indexOf("\n    ports:\n");
    if (portsIndex !== -1) {
      block = block.slice(0, portsIndex) + `\n    volumes:\n      - ${volumeLine}\n` + block.slice(portsIndex);
    } else {
      block = block.trimEnd() + `\n    volumes:\n      - ${volumeLine}\n`;
    }
  }

  content = content.replace(match[1], block);
}

// API schreibt Logs nach /app/logs, weil decision-log.ts process.cwd()/logs nutzt.
ensureVolumeBlockForService("api", "./logs:/app/logs");

// Frontend API-Routen lesen ../logs relativ zu /app, also /logs.
ensureVolumeBlockForService("frontend", "./logs:/logs:ro");

if (content === original) {
  console.log("Keine Änderung nötig. Shared Logs Volumes sind bereits vorhanden.");
} else {
  fs.writeFileSync(file, content, "utf8");
  console.log("docker-compose.internal.yml wurde um Shared Logs Volumes erweitert:");
  console.log("- api: ./logs:/app/logs");
  console.log("- frontend: ./logs:/logs:ro");
}
