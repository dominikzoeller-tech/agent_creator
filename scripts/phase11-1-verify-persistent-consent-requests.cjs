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
console.log(" Phase 11.1 Persistent Consent Requests Verify");
console.log("======================================");
let ok = true;
ok = check("frontend/lib/tool-consent-store.ts", ["createToolConsentRequest", "decideToolConsentRequest", "tool-consent-requests.json", "REDACTED_SECRET"]) && ok;
ok = check("frontend/app/api/tool-consent/route.ts", ["GET", "POST", "PATCH", "decideToolConsentRequest"]) && ok;
ok = check("frontend/app/tool-consent/page.tsx", ["Tool Consent Requests", "Consent Request erstellen", "Genehmigen", "Ablehnen"]) && ok;
ok = check("package.json", ["tools:consent:verify"]) && ok;
if (!ok) { console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Persistent Consent Requests sind vorbereitet.");
