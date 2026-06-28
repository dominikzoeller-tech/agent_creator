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
console.log(" Phase 9.1 Web Research Agent Flow Verify");
console.log("======================================");
let ok = true;
ok = check("web-research.ts", ["runWebResearch", "shouldUseWebResearch", "sanitizeWebResearchQuery", "mergeWebResearchContext"]) && ok;
ok = check("server.ts", ["shouldUseWebResearch", "sanitizeWebResearchQuery", "runWebResearch", "mergeWebResearchContext", "usedWebResearch", "webResearchResults"]) && ok;
ok = check("decision-log.ts", ["usedWebResearch?: boolean", "webResearchResults?: unknown[]"]) && ok;
ok = check("Dockerfile", ["COPY web-research.ts ./"]) && ok;
ok = check("docker-compose.internal.yml", ["WEB_RESEARCH_ENABLED", "BING_SEARCH_API_KEY"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Web Research ist in den Agent Flow integriert.");
