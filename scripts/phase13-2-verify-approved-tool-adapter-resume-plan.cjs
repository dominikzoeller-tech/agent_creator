const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 13.2 Approved Tool Adapter Resume Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/approved-tool-adapter-resume-store.ts", ["createApprovedToolAdapterResumePlan", "resume_dry_run_allowed", "toolExecutionAllowed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/tool-adapter-resume/route.ts", ["createApprovedToolAdapterResumePlan", "GET", "POST"]) && ok;
ok = check("frontend/app/tool-adapter-resume/page.tsx", ["Approved Tool Adapter Resume Plan", "Resume Plans", "toolExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/tool-adapter-resume", "Tool Resume", "tool-adapter-resume"]) && ok;
ok = check("phase13-2-approved-tool-adapter-resume-plan.md", ["Phase 13.2", "toolExecutionAllowed", "Phase 13.3"]) && ok;
ok = check("docs/phase13-approved-tool-adapter-resume-plan-runbook.md", ["phase13:2:patch", "phase13:2:verify", "/tool-adapter-resume"]) && ok;
ok = check("package.json", ["phase13:2:patch", "phase13:2:verify", "tools:adapter:resume:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 13.2 Approved Tool Adapter Resume Plan ist vorbereitet.");
