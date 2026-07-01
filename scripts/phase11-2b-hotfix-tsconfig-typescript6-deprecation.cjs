const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function readJson(file){ return JSON.parse(fs.readFileSync(full(file), "utf8")); }
function writeJson(file, value){ fs.writeFileSync(full(file), JSON.stringify(value, null, 2) + "\n", "utf8"); }
function patchTsconfig(){
  const file = "tsconfig.json";
  const tsconfig = readJson(file);
  tsconfig.compilerOptions = tsconfig.compilerOptions || {};
  // TypeScript 6 warnt/errorisiert moduleResolution "Node" als node10-deprecated.
  // Für diesen bestehenden CommonJS/ts-node Stack ist das minimal-invasive Fixing,
  // ohne jetzt die gesamte Module-Resolution-Strategie umzubauen.
  if (tsconfig.compilerOptions.ignoreDeprecations !== "6.0") {
    tsconfig.compilerOptions.ignoreDeprecations = "6.0";
    writeJson(file, tsconfig);
    console.log("OK tsconfig.json: ignoreDeprecations=6.0 ergänzt.");
  } else {
    console.log("SKIP tsconfig.json: ignoreDeprecations=6.0 bereits vorhanden.");
  }
}
function patchPackage(){
  const file = "package.json";
  const pkg = readJson(file);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["phase11:2b:hotfix"] = "node scripts/phase11-2b-hotfix-tsconfig-typescript6-deprecation.cjs";
  pkg.scripts["phase11:2b:verify"] = "node scripts/phase11-2b-verify-tsconfig-typescript6-deprecation.cjs";
  writeJson(file, pkg);
  console.log("OK package.json: Phase 11.2b Scripts eingetragen.");
}
patchTsconfig();
patchPackage();
console.log("Phase 11.2b Hotfix abgeschlossen.");
