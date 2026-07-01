const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function read(file){ return fs.readFileSync(full(file), "utf8"); }
function fail(msg){ console.error("MISS " + msg); process.exitCode = 1; }
function ok(msg){ console.log("OK   " + msg); }
console.log("======================================");
console.log(" Phase 11.2a Compose Consent Hotfix Verify");
console.log("======================================");
const compose = read("docker-compose.internal.yml");
const frontendBuildStart = compose.indexOf("  frontend:\n");
const frontendEnvStart = compose.indexOf("    environment:\n", frontendBuildStart);
const frontendBuildBlock = compose.slice(frontendBuildStart, frontendEnvStart >= 0 ? frontendEnvStart : compose.length);
if (/TOOL_CONSENT_DATA_DIR:\s*\/data/.test(frontendBuildBlock)) fail("TOOL_CONSENT_DATA_DIR steht noch im frontend build Block"); else ok("TOOL_CONSENT_DATA_DIR nicht im frontend build Block");
const envCount = (compose.match(/TOOL_CONSENT_DATA_DIR:\s*\/data/g) || []).length;
if (envCount >= 2) ok("TOOL_CONSENT_DATA_DIR mindestens für API und Frontend gesetzt"); else fail("TOOL_CONSENT_DATA_DIR fehlt in environment Blöcken");
const volumeCount = (compose.match(/- \.\/data:\/data/g) || []).length;
if (volumeCount >= 2) ok("./data:/data für API und Frontend gesetzt"); else fail("./data:/data Volume fehlt");
const pkg = JSON.parse(read("package.json"));
if (pkg.scripts && pkg.scripts.build) ok("package.json enthält build Script"); else fail("package.json build Script fehlt");
if (pkg.scripts && pkg.scripts["phase11:2a:hotfix"] && pkg.scripts["phase11:2a:verify"]) ok("Phase 11.2a Scripts vorhanden"); else fail("Phase 11.2a Scripts fehlen");
if (process.exitCode) process.exit(1);
console.log("Verify OK. Compose Hotfix ist vorbereitet.");
