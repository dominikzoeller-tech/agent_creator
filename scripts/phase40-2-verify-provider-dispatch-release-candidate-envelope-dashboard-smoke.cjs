const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return exists(file) ? fs.readFileSync(full(file), "utf8") : ""; }
function check(file, patterns){
  if(!exists(file)){ console.log("MISS " + file); return false; }
  const content = read(file);
  let ok = true;
  for(const p of patterns){
    const found = content.includes(p);
    console.log((found ? "OK  " : "MISS") + " " + file + ": " + p);
    if(!found) ok = false;
  }
  return ok;
}
console.log("======================================");
console.log(" Phase 40.2 Release Candidate Dashboard Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/app/provider-dispatch-release-candidate-envelope-dashboard/page.tsx", [
  "Provider Dispatch Release Candidate Envelope Dashboard",
  "Provider Dispatch Release Candidate Envelope Übersicht",
  "releaseCandidateReadyForHumanReview=true",
  "releaseCandidateApproved=false",
  "releaseCandidateExecuted=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("frontend/components/UnifiedNavigation.tsx", [
  "/provider-dispatch-release-candidate-envelope-dashboard",
  "RC Dashboard",
  "provider-dispatch-release-candidate-envelope-dashboard"
]) && ok;
ok = check("scripts/phase40-2-provider-dispatch-release-candidate-envelope-dashboard-smoke.cjs", [
  "Phase 40.2 Provider Dispatch Release Candidate Envelope Dashboard Smoke",
  "UI RC Dashboard",
  "API RC Policy"
]) && ok;
ok = check("phase40-2-provider-dispatch-release-candidate-envelope-dashboard-smoke.md", [
  "Phase 40.2",
  "Provider Dispatch Release Candidate Envelope Dashboard",
  "Phase 40.3",
  "releaseCandidateReadyForHumanReview=true",
  "releaseCandidateApproved=false",
  "releaseCandidateExecuted=false",
  "networkCallPerformed=false",
  "providerExecutionAllowed=false",
  "dryRunOnly=true"
]) && ok;
ok = check("docs/phase40-provider-dispatch-release-candidate-envelope-dashboard-smoke-runbook.md", [
  "phase40:2:verify",
  "phase40:2:smoke"
]) && ok;
ok = check("package.json", [
  "phase40:2:patch",
  "phase40:2:verify",
  "phase40:2:smoke",
  "llm:provider-dispatch-release-candidate-envelope:release:check"
]) && ok;
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 40.2 Provider Dispatch Release Candidate Envelope Dashboard & Smoke ist vorbereitet.");
