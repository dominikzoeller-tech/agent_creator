const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 12.0 Controlled Agent Runtime Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/controlled-agent-runtime-store.ts", ["createControlledAgentRuntimeEnvelope", "toolExecutionAllowed: false", "dryRunOnly: true", "controlled-agent-runtime-envelopes.jsonl"]) && ok;
ok = check("frontend/app/api/agent-runtime/route.ts", ["createControlledAgentRuntimeEnvelope", "GET", "POST"]) && ok;
ok = check("frontend/app/agent-runtime/page.tsx", ["Controlled Agent Runtime Foundation", "Dry-run Envelope", "toolExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/agent-runtime", "Agent Runtime", "agent-runtime"]) && ok;
ok = check("phase12-0-controlled-agent-runtime-foundation.md", ["Phase 12.0", "toolExecutionAllowed", "dryRunOnly", "Phase 12.1"]) && ok;
ok = check("docs/phase12-controlled-agent-runtime-foundation-runbook.md", ["phase12:0:patch", "phase12:0:verify", "/agent-runtime"]) && ok;
ok = check("package.json", ["phase12:0:patch", "phase12:0:verify", "agents:runtime:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 12.0 Controlled Agent Runtime Foundation ist vorbereitet.");
