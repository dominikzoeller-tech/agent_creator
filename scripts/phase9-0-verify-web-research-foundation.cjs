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
console.log(" Phase 9.0 Web Research Foundation Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/web-research.ts", ["runWebResearch", "WEB_RESEARCH_ENABLED", "BING_SEARCH_API_KEY", "Bing Search Fehler"]) && ok;
ok = check("frontend/app/api/web-research/route.ts", ["runWebResearch", "export async function GET", "export async function POST"]) && ok;
ok = check("frontend/app/web-research/page.tsx", ["Web Research Tool", "Recherche testen", "WEB_RESEARCH_ENABLED"]) && ok;
ok = check("docker-compose.internal.yml", ["WEB_RESEARCH_ENABLED", "BING_SEARCH_API_KEY"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Web Research Tool Foundation ist vorbereitet.");
