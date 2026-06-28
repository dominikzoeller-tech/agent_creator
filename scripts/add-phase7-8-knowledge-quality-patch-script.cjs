const fs = require("fs");
const path = require("path");
const packageJsonPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(packageJsonPath)) { console.error("package.json wurde nicht gefunden."); process.exit(1); }
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["knowledge:quality:patch"] = "node scripts/phase7-8-patch-knowledge-quality.cjs";
fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
console.log("Script knowledge:quality:patch wurde zu package.json hinzugefügt/aktualisiert.");
