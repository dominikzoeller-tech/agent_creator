const fs = require("fs");
const path = require("path");
function check(file, patterns) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) { console.log(`MISS ${file}`); return false; }
  const content = fs.readFileSync(full, "utf8");
  let ok = true;
  for (const pattern of patterns) {
    const found = content.includes(pattern);
    console.log(`${found ? "OK  " : "MISS"} ${file}: ${pattern}`);
    if (!found) ok = false;
  }
  return ok;
}
console.log("======================================");
console.log(" Phase 9.2 AI Web Research Summary Verify");
console.log("======================================");
let ok = true;
ok = check("web-research-summary.ts", ["summarizeWebResearchResults", "OPENAI_API_KEY", "WebResearchSummaryResult", "Quelle 1"]) && ok;
ok = check("server.ts", ["summarizeWebResearchResults", "const webResearchSummary = await summarizeWebResearchResults", "usedWebResearchSummary", "webResearchSources"]) && ok;
ok = check("decision-log.ts", ["usedWebResearchSummary?: boolean", "webResearchSummary?: string", "webResearchSources?: unknown[]"]) && ok;
ok = check("Dockerfile", ["COPY web-research-summary.ts ./"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. AI Web Research Summary ist integriert.");
