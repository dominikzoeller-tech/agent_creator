const fs = require("fs");
const path = require("path");
const file = path.join(process.cwd(), "scripts", "phase13-0-patch-tool-adapter-registry-sandbox.cjs");
console.log("======================================");
console.log(" Phase 13.0a Patch-Script Syntax Verify");
console.log("======================================");
if (!fs.existsSync(file)) { console.error("MISS phase13-0 Patch-Script fehlt"); process.exit(1); }
const content = fs.readFileSync(file, "utf8");
let ok = true;
function check(label, condition){ console.log((condition ? "OK  " : "MISS") + " " + label); if(!condition) ok=false; }
check("keine literal \\n Sequenz vor function patchPackage", !content.includes("}\\nfunction patchPackage"));
try { new Function(content); check("Patch-Script syntaktisch lesbar", true); } catch(error){ check("Patch-Script syntaktisch lesbar", false); console.error(error instanceof Error ? error.message : String(error)); }
if(!ok){ console.error("Verify fehlgeschlagen."); process.exit(1); }
console.log("Verify OK. Phase 13.0 Patch-Script kann jetzt ausgeführt werden.");
