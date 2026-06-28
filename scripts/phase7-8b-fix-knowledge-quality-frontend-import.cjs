const fs = require("fs");
const path = require("path");

function full(file) {
  return path.join(process.cwd(), file);
}

function read(file) {
  return fs.readFileSync(full(file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(full(file), content, "utf8");
}

function copyQualityModuleIntoFrontend() {
  const sourceFile = "knowledge-quality.ts";
  const targetFile = "frontend/lib/knowledge-quality.ts";

  if (!fs.existsSync(full(sourceFile))) {
    console.error("knowledge-quality.ts wurde im Projekt-Root nicht gefunden. Bitte Phase 7.8 zuerst entpacken/anwenden.");
    process.exit(1);
  }

  const source = read(sourceFile);
  write(targetFile, source);
  console.log("OK frontend/lib/knowledge-quality.ts aus knowledge-quality.ts erstellt/aktualisiert.");
}

function patchFrontendRouteImport() {
  const file = "frontend/app/api/knowledge-quality/route.ts";
  if (!fs.existsSync(full(file))) {
    console.error("frontend/app/api/knowledge-quality/route.ts wurde nicht gefunden.");
    process.exit(1);
  }

  let content = read(file);
  const original = content;

  content = content.replace(
    'import { buildKnowledgeQualityReport } from "../../../../knowledge-quality";',
    'import { buildKnowledgeQualityReport } from "../../../lib/knowledge-quality";'
  );

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/api/knowledge-quality/route.ts Import auf frontend/lib geändert.");
  } else if (content.includes('from "../../../lib/knowledge-quality"')) {
    console.log("SKIP Knowledge-Quality Route nutzt bereits frontend/lib Import.");
  } else {
    console.log("INFO Kein bekannter Import-Marker gefunden. Bitte route.ts manuell prüfen.");
  }
}

function addScript() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["knowledge:quality:frontendfix"] = "node scripts/phase7-8b-fix-knowledge-quality-frontend-import.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: knowledge:quality:frontendfix eingetragen.");
}

copyQualityModuleIntoFrontend();
patchFrontendRouteImport();
addScript();
console.log("Phase 7.8b Knowledge Quality Frontend Import Fix abgeschlossen.");
