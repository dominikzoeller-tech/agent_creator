const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log(`MISS ${file}`); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log(`${found?"OK  ":"MISS"} ${file}: ${p}`); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 11.4 Missing Capability Verify"); console.log("======================================");
let ok=true;
ok = check("tool-capability-request-agent-flow.ts", ["inferMissingCapabilityRequest", "createAgentFlowCapabilityRequest", "agent-flow", "tool-capability-requests.json", "pending"]) && ok;
ok = check("server.ts", ["PHASE 11.4: Missing Tool / Capability Request Flow", "inferMissingCapabilityRequest", "createAgentFlowCapabilityRequest", "capabilityRequestId", "/capability-requests?requestId="]) && ok;
ok = check("frontend/lib/tool-capability-request-store.ts", ["listCapabilityRequests", "createCapabilityRequest", "decideCapabilityRequest", "implemented"]) && ok;
ok = check("frontend/app/api/capability-requests/route.ts", ["GET", "POST", "PATCH", "decideCapabilityRequest"]) && ok;
ok = check("frontend/app/capability-requests/page.tsx", ["Missing Tool / Capability Requests", "Capability Request erstellen", "Implemented"]) && ok;
ok = check("frontend/components/MissingCapabilityRequestPanel.tsx", ["MissingCapabilityRequestPanel", "Capability Request öffnen", "keine passende bestehende Fähigkeit"]) && ok;
ok = check("frontend/app/page.tsx", ["MissingCapabilityRequestPanel", "<MissingCapabilityRequestPanel response={response} />", "/capability-requests"]) && ok;
ok = check("Dockerfile", ["COPY tool-capability-request-agent-flow.ts ./"]) && ok;
ok = check("phase11-4-missing-tool-capability-request-flow.md", ["Phase 11.4", "capabilityRequestId", "Agent Blueprint Proposal"]) && ok;
ok = check("docs/phase11-missing-tool-capability-request-flow-runbook.md", ["phase11:4:patch", "phase11:4:verify", "/capability-requests"]) && ok;
ok = check("package.json", ["phase11:4:patch", "phase11:4:verify", "tools:capabilities:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.4 Missing Tool / Capability Request Flow ist vorbereitet.");
