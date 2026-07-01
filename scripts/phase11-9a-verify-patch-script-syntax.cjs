const fs = require("fs");
const path = require("path");
const file = path.join(process.cwd(), "scripts", "phase11-9-patch-governance-release-polish.cjs");
console.log("======================================");
console.log(" Phase 11.9a Patch-Script Syntax Verify");
console.log("======================================");
if (!fs.existsSync(file)) { console.error("MISS phase11-9 Patch-Script fehlt"); process.exit(1); }
const content = fs.readFileSync(file, "utf8");
let ok = true;
function check(label, condition){ console.log((condition ? "OK  " : "MISS") + " " + label); if(!condition) ok=false; }
check("kein nested Smoke console.log Template Literal", !content.includes('console.log(`${good ? "OK  " : "MISS"}'));
check("kein nested MISS Template Literal", !content.includes('console.log(`MISS ${label}: ${url}`'));
try { new Function(content); check("Patch-Script syntaktisch lesbar", true); } catch(error){ check("Patch-Script syntaktisch lesbar", false); console.error(error instanceof Error ? error.message : String(error)); }
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 11.9 Patch-Script kann jetzt ausgeführt werden.");
