const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 13.0 Tool Adapter Sandbox Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/tool-adapter-registry-store.ts", ["registerToolAdapter", "createToolExecutionSandboxPlan", "toolExecutionAllowed: false", "dryRunOnly: true", "tool-adapter-registry.json"]) && ok;
ok = check("frontend/app/api/tool-adapters/route.ts", ["registerToolAdapter", "createToolExecutionSandboxPlan", "GET", "POST", "PATCH"]) && ok;
ok = check("frontend/app/tool-sandbox/page.tsx", ["Controlled Tool Execution Sandbox", "Dry-run Execution Plan", "toolExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/tool-sandbox", "Tool Sandbox", "tool-sandbox"]) && ok;
ok = check("phase13-0-tool-adapter-registry-sandbox.md", ["Phase 13.0", "Tool Adapter", "Phase 13.1", "toolExecutionAllowed"]) && ok;
ok = check("docs/phase13-tool-adapter-registry-sandbox-runbook.md", ["phase13:0:patch", "phase13:0:verify", "/tool-sandbox"]) && ok;
ok = check("package.json", ["phase13:0:patch", "phase13:0:verify", "tools:adapter:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 13.0 Controlled Tool Execution Sandbox ist vorbereitet.");
