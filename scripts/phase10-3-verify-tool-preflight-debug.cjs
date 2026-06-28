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
console.log(" Phase 10.3 Tool Preflight Agent Debug Verify");
console.log("======================================");
let ok = true;
ok = check("tool-preflight-debug.ts", ["buildAgentDebugToolPreflight", "candidateToolIds", "allowedToolIds", "blockedToolIds"]) && ok;
ok = check("server.ts", ["buildAgentDebugToolPreflight", "const toolPreflight", "toolPreflight"]) && ok;
ok = check("decision-log.ts", ["toolPreflight?: unknown"]) && ok;
ok = check("Dockerfile", ["COPY tool-preflight-debug.ts ./"]) && ok;
ok = check("package.json", ["tools:preflight:debug:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Tool Preflight ist im Agent Debug vorbereitet.");
