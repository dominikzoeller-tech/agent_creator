const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(packageJsonPath)) {
  console.error("package.json wurde im aktuellen Ordner nicht gefunden. Bitte im Projekt-Root ausführen.");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["knowledge:flow:verify"] = "node scripts/phase7-3b-verify-knowledge-flow.cjs";
fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
console.log("Script knowledge:flow:verify wurde zu package.json hinzugefügt/aktualisiert.");
