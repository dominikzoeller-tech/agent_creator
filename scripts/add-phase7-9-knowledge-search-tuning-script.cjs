const fs = require("fs");
const path = require("path");
const packageJsonPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(packageJsonPath)) { console.error("package.json wurde nicht gefunden."); process.exit(1); }
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["knowledge:search:tune"] = "node scripts/phase7-9-patch-knowledge-search-tuning.cjs";
pkg.scripts["knowledge:search:smoke"] = "npx ts-node knowledge-search-tuning-smoke-test.ts";
fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
console.log("Scripts knowledge:search:tune und knowledge:search:smoke wurden zu package.json hinzugefügt/aktualisiert.");
