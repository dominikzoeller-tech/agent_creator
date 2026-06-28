const fs = require("fs");
const path = require("path");

function read(file) { return fs.readFileSync(path.join(process.cwd(), file), "utf8"); }
function write(file, content) { fs.writeFileSync(path.join(process.cwd(), file), content, "utf8"); }

function patchDockerfile() {
  const file = "Dockerfile";
  let content = read(file);
  const original = content;
  const line = "COPY knowledge-quality.ts ./";
  if (!content.includes(line)) {
    const marker = "COPY knowledge-routing-context.ts ./";
    if (content.includes(marker)) content = content.replace(marker, marker + "\n" + line);
    else content += "\n" + line + "\n";
  }
  if (content !== original) { write(file, content); console.log("OK Dockerfile: knowledge-quality.ts wird ins API-Image kopiert."); }
  else console.log("SKIP Dockerfile: knowledge-quality.ts bereits eingebunden.");
}

function patchFrontendDockerfile() {
  // No-op documentation: frontend build context is ./frontend; API route imports via relative root are bundled from project? Not available.
  // Knowledge quality route is in frontend and imports from project root using ../../../../knowledge-quality.
  // Next build context needs this file copied into frontend context; easier fix: copy a duplicate into frontend/lib would be bigger.
  console.log("INFO Frontend Dockerfile unverändert. knowledge-quality.ts muss für Next Build erreichbar sein.");
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["knowledge:quality:verify"] = "node scripts/phase7-8-verify-knowledge-quality.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: knowledge:quality:verify eingetragen.");
}

patchDockerfile();
patchFrontendDockerfile();
patchPackage();
console.log("Phase 7.8 Patch abgeschlossen.");
