const fs = require("fs");
const path = require("path");

function read(file) { return fs.readFileSync(path.join(process.cwd(), file), "utf8"); }
function write(file, content) { fs.writeFileSync(path.join(process.cwd(), file), content, "utf8"); }

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["memory:quality:verify"] = "node scripts/phase8-6-verify-memory-quality.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: memory:quality:verify eingetragen.");
}

patchPackage();
console.log("Phase 8.6 Patch abgeschlossen.");
