const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function run(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    return `ERROR: ${error.stderr?.toString() || error.message}`.trim();
  }
}

function exists(file) {
  return fs.existsSync(path.join(process.cwd(), file));
}

const requiredFiles = [
  "agent-capabilities.ts",
  "agent-routing-details.ts",
  "council-routing-metadata.ts",
  "council-engine.ts",
  "decision-log.ts",
  "server.ts",
  "docker-compose.internal.yml",
  "frontend/components/RoutingMetadataPanel.tsx",
  "frontend/components/AgentRoutingAnalyticsPanel.tsx",
  "frontend/app/analytics/page.tsx",
  "frontend/app/api/analytics/route.ts",
  "frontend/app/api/logs/route.ts",
  "frontend/lib/types.ts",
  "README.md",
  "package.json"
];

console.log("======================================");
console.log(" Phase 6.9 Release Preflight");
console.log("======================================");
console.log("");

let ok = true;
for (const file of requiredFiles) {
  const found = exists(file);
  console.log(`${found ? "OK  " : "MISS"} ${file}`);
  if (!found) ok = false;
}

console.log("");
console.log("Git status:");
console.log(run("git status --short") || "clean");

console.log("");
console.log("Docker Compose config:");
const composeConfig = run("docker compose -f docker-compose.internal.yml config");
console.log(composeConfig.startsWith("ERROR:") ? composeConfig : "OK docker-compose.internal.yml ist valide.");
if (composeConfig.startsWith("ERROR:")) ok = false;

console.log("");
console.log("Letzte Tags:");
console.log(run("git tag --list") || "keine Tags gefunden");

console.log("");
if (!ok) {
  console.error("Preflight NICHT vollständig. Bitte fehlende Dateien/Compose-Fehler prüfen.");
  process.exit(1);
}

console.log("Preflight OK. Release-Tag kann nach Commit und finalem Healthcheck gesetzt werden.");
