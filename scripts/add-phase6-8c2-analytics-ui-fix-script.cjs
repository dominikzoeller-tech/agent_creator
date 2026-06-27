const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(packageJsonPath)) {
  console.error("package.json wurde im aktuellen Ordner nicht gefunden. Bitte im Projekt-Root ausführen.");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["phase6:analytics:ui:fix"] = "node scripts/phase6-8c2-fix-analytics-ui-variable.cjs";
fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
console.log("Script phase6:analytics:ui:fix wurde zu package.json hinzugefügt/aktualisiert.");
