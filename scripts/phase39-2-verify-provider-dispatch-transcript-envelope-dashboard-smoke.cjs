const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if (!exists(file)) { console.log("MISS " + file); return false; }
  const content = read(file); let ok = true;
  for (const p of patterns) { const found = content.includes(p); console.log((found ? "OK  " : "MISS") + " " + file + ": " + p); if (!found) ok = false; }
  return ok;
}
console.log("======================================");
console.log(" Phase 39.2 Provider Dispatch Transcript Envelope Dashboard Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/provider-dispatch-transcript-envelope-dashboard/page.tsx", [
  "Provider Dispatch Transcript Envelope Dashboard",
  "Provider Dispatch Transcript Envelope Übersicht",
  "providerDispatchTranscriptEnvelopePrepared=true",
  "transcriptEnvelopePrepared=true",
  "transcriptEnvelopePersisted=true",
  "transcriptEnvelopeContainsProviderResponse=false",
  "transcriptEnvelopeContainsPromptPayload=false",
  "transcriptEnvelopeContainsSecrets=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", ["/provider-dispatch-transcript-envelope-dashboard", "Transcript Dashboard", "provider-dispatch-transcript-envelope-dashboard"]) && ok;
ok = check("scripts/phase39-2-provider-dispatch-transcript-envelope-dashboard-smoke.cjs", ["Phase 39.2 Provider Dispatch Transcript Envelope Dashboard Smoke", "UI Provider Dispatch Transcript Dashboard", "API Provider Dispatch Transcript Policy"]) && ok;
ok = check("phase39-2-provider-dispatch-transcript-envelope-dashboard-smoke.md", ["Phase 39.2", "Provider Dispatch Transcript Envelope Dashboard", "Phase 39.3", "providerDispatchTranscriptEnvelopePrepared=true", "transcriptEnvelopeContainsProviderResponse=false", "transcriptEnvelopeContainsPromptPayload=false", "transcriptEnvelopeContainsSecrets=false", "networkCallPerformed=false", "providerExecutionAllowed=false", "dryRunOnly=true"]) && ok;
ok = check("docs/phase39-provider-dispatch-transcript-envelope-dashboard-smoke-runbook.md", ["phase39:2:patch", "phase39:2:verify", "phase39:2:smoke"]) && ok;
ok = check("package.json", ["phase39:2:patch", "phase39:2:verify", "phase39:2:smoke", "llm:provider-dispatch-transcript-envelope:release:check"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 39.2 Provider Dispatch Transcript Envelope Dashboard & Smoke ist vorbereitet.");
