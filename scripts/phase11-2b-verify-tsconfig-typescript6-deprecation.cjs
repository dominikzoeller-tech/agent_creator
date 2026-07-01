const fs = require("fs");
const path = require("path");
function full(file){ return path.join(process.cwd(), file); }
function readJson(file){ return JSON.parse(fs.readFileSync(full(file), "utf8")); }
function ok(msg){ console.log("OK   " + msg); }
function miss(msg){ console.error("MISS " + msg); process.exitCode = 1; }
console.log("======================================");
console.log(" Phase 11.2b TypeScript 6 Deprecation Verify");
console.log("======================================");
const tsconfig = readJson("tsconfig.json");
if (tsconfig.compilerOptions && tsconfig.compilerOptions.ignoreDeprecations === "6.0") ok("tsconfig.json enthält compilerOptions.ignoreDeprecations=6.0"); else miss("tsconfig.json ignoreDeprecations=6.0 fehlt");
const pkg = readJson("package.json");
if (pkg.scripts && pkg.scripts["phase11:2b:hotfix"] && pkg.scripts["phase11:2b:verify"]) ok("package.json enthält Phase 11.2b Scripts"); else miss("package.json Phase 11.2b Scripts fehlen");
if (pkg.scripts && pkg.scripts.build) ok("package.json enthält build Script"); else miss("package.json build Script fehlt");
if (process.exitCode) process.exit(1);
console.log("Verify OK. TypeScript 6 Deprecation Hotfix ist vorbereitet.");
