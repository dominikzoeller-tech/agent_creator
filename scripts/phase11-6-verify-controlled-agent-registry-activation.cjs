const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 11.6 Controlled Agent Registry Verify"); console.log("======================================");
let ok=true;
ok = check("controlled-agent-registry.ts", ["registerControlledAgentFromBlueprint", "controlled-agent-registry.json", "test_mode", "requiresConsent"]) && ok;
ok = check("frontend/lib/controlled-agent-registry-store.ts", ["listControlledAgents", "registerControlledAgent", "updateControlledAgentStatus", "active"]) && ok;
ok = check("frontend/app/api/agent-registry/route.ts", ["GET", "POST", "PATCH", "updateControlledAgentStatus"]) && ok;
ok = check("frontend/app/agent-registry/page.tsx", ["Controlled Agent Registry", "Agent in Test Mode registrieren", "Disabled"]) && ok;
ok = check("frontend/app/page.tsx", ["/agent-registry"]) && ok;
ok = check("Dockerfile", ["COPY controlled-agent-registry.ts ./"]) && ok;
ok = check("phase11-6-controlled-agent-registry-activation.md", ["Phase 11.6", "test_mode", "keine automatische Code-Erzeugung"]) && ok;
ok = check("docs/phase11-controlled-agent-registry-activation-runbook.md", ["phase11:6:patch", "phase11:6:verify", "/agent-registry"]) && ok;
ok = check("package.json", ["phase11:6:patch", "phase11:6:verify", "agents:registry:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.6 Controlled Agent Registry Activation ist vorbereitet.");
