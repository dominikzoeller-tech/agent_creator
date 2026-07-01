const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 12.1 Runtime Consent Binding Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/agent-runtime-consent-binding-store.ts", ["createRuntimeConsentBinding", "syncRuntimeConsentBindingStatuses", "agent-runtime-consent-bindings.json", "tool-consent-requests.json"]) && ok;
ok = check("frontend/app/api/agent-runtime-consent/route.ts", ["createRuntimeConsentBinding", "GET", "POST"]) && ok;
ok = check("frontend/app/agent-runtime-consent/page.tsx", ["Runtime Consent Binding", "Runtime Consent Binding erstellen", "Consent Request öffnen"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/agent-runtime-consent", "Runtime Consent", "agent-runtime-consent"]) && ok;
ok = check("phase12-1-runtime-consent-binding.md", ["Phase 12.1", "Runtime Consent Binding", "Phase 12.2"]) && ok;
ok = check("docs/phase12-runtime-consent-binding-runbook.md", ["phase12:1:patch", "phase12:1:verify", "/agent-runtime-consent"]) && ok;
ok = check("package.json", ["phase12:1:patch", "phase12:1:verify", "agents:runtime:consent:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 12.1 Runtime Consent Binding ist vorbereitet.");
