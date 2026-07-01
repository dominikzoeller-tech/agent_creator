const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 11.8 Governance Audit Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/governance-audit-store.ts", ["appendGovernanceAuditEvent", "readGovernanceAuditEvents", "governance-audit.jsonl", "summarizeGovernanceAudit"]) && ok;
ok = check("frontend/app/api/governance-audit/route.ts", ["readGovernanceAuditEvents", "summarizeGovernanceAudit", "export async function GET"]) && ok;
ok = check("frontend/app/governance-audit/page.tsx", ["Governance Audit Trail", "UnifiedNavigation", "Events", "Summary"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/governance-audit", "Audit Trail", "governance-audit"]) && ok;
ok = check("frontend/app/api/capability-requests/route.ts", ["appendGovernanceAuditEvent", "capability_request_created", "capability_request_decided"]) && ok;
ok = check("frontend/app/api/agent-blueprints/route.ts", ["appendGovernanceAuditEvent", "agent_blueprint_created", "agent_blueprint_decided"]) && ok;
ok = check("frontend/app/api/agent-registry/route.ts", ["appendGovernanceAuditEvent", "agent_registry_registered", "agent_registry_status_changed"]) && ok;
ok = check("phase11-8-agent-registry-analytics-audit-trail.md", ["Phase 11.8", "governance-audit", "agent_registry_status_changed"]) && ok;
ok = check("docs/phase11-agent-registry-analytics-audit-trail-runbook.md", ["phase11:8:patch", "phase11:8:verify", "/governance-audit"]) && ok;
ok = check("package.json", ["phase11:8:patch", "phase11:8:verify", "governance:audit:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.8 Agent Registry Analytics & Audit Trail ist vorbereitet.");
