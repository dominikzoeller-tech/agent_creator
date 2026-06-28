const fs = require("fs");
const path = require("path");
const packageJsonPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(packageJsonPath)) {
  console.error("package.json wurde nicht gefunden.");
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["knowledge:search:repair"] = "node scripts/phase7-9c-repair-knowledge-base-search.cjs";
pkg.scripts["knowledge:search:repair:verify"] = "node scripts/phase7-9c-verify-knowledge-base-search-repair.cjs";
fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
console.log("Scripts knowledge:search:repair und knowledge:search:repair:verify wurden eingetragen.");
