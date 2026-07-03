const fs = require("fs"); const path = require("path");
function full(file){ return path.join(process.cwd(), file); } function exists(file){ return fs.existsSync(full(file)); } function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){ if(!exists(file)){ console.log("MISS " + file); return false; } const content=read(file); let ok=true; for(const p of patterns){ const found=content.includes(p); console.log((found?"OK  ":"MISS") + " " + file + ": " + p); if(!found) ok=false; } return ok; }
console.log("======================================"); console.log(" Phase 13.1 Tool Adapter Consent Verify"); console.log("======================================");
let ok=true;
ok = check("frontend/lib/tool-adapter-consent-binding-store.ts", ["createToolAdapterConsentBinding", "syncToolAdapterConsentBindingStatuses", "tool-adapter-consent-bindings.json", "toolExecutionAllowed:false"]) && ok;
ok = check("frontend/app/api/tool-adapter-consent/route.ts", ["createToolAdapterConsentBinding", "GET", "POST"]) && ok;
ok = check("frontend/app/tool-adapter-consent/page.tsx", ["Tool Adapter Consent Binding", "Tool Adapter Consent Binding erstellen", "Consent Request öffnen", "dryRunOnly"]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/tool-adapter-consent", "Tool Consent Binding", "tool-adapter-consent"]) && ok;
ok = check("phase13-1-tool-adapter-consent-binding.md", ["Phase 13.1", "Tool Adapter Consent Binding", "Phase 13.2"]) && ok;
ok = check("docs/phase13-tool-adapter-consent-binding-runbook.md", ["phase13:1:patch", "phase13:1:verify", "/tool-adapter-consent"]) && ok;
ok = check("package.json", ["phase13:1:patch", "phase13:1:verify", "tools:adapter:consent:verify"]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 13.1 Tool Adapter Consent Binding ist vorbereitet.");
