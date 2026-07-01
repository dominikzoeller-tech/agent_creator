const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 12.2 Approved Runtime Resume Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/approved-runtime-resume-store.ts", ["createApprovedRuntimeResumeEnvelope", "resume_dry_run_allowed", "toolExecutionAllowed: false", "dryRunOnly: true"]) && ok;
ok = check("frontend/app/api/agent-runtime-resume/route.ts", ["createApprovedRuntimeResumeEnvelope", "GET", "POST"]) && ok;
ok = check("frontend/app/agent-runtime-resume/page.tsx", ["Approved Runtime Resume Envelope", "Runtime Resume Envelopes", "toolExecutionAllowed", "dryRunOnly"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/agent-runtime-resume", "Runtime Resume", "agent-runtime-resume"]) && ok;
ok = check("phase12-2-approved-runtime-resume-envelope.md", ["Phase 12.2", "toolExecutionAllowed", "Phase 12.3"]) && ok;
ok = check("docs/phase12-approved-runtime-resume-envelope-runbook.md", ["phase12:2:patch", "phase12:2:verify", "/agent-runtime-resume"]) && ok;
ok = check("package.json", ["phase12:2:patch", "phase12:2:verify", "agents:runtime:resume:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 12.2 Approved Runtime Resume Envelope ist vorbereitet.");
