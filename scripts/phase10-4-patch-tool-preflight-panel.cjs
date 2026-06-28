const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchPage() {
  const file = "frontend/app/page.tsx";
  let content = read(file);
  const original = content;

  const importLine = 'import { ToolPreflightPanel } from "../components/ToolPreflightPanel";';
  if (!content.includes(importLine)) {
    const lines = content.split(/\r?\n/);
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImport = i;
    if (lastImport === -1) throw new Error("Importbereich in frontend/app/page.tsx nicht gefunden.");
    lines.splice(lastImport + 1, 0, importLine);
    content = lines.join("\n");
  }

  if (!content.includes("<ToolPreflightPanel response={response} />")) {
    const insertLine = "                <ToolPreflightPanel response={response} />";
    const webResearchPanelRegex = /^(\s*<WebResearchPanel\s+response=\{response\}\s*\/>)\s*$/m;
    const memoryPanelRegex = /^(\s*<MemoryHitsPanel\s+response=\{response\}\s*\/>)\s*$/m;
    const debugPanelRegex = /^(\s*<DebugResponsePanel\b[^>]*\/>)\s*$/m;

    if (webResearchPanelRegex.test(content)) content = content.replace(webResearchPanelRegex, `$1\n${insertLine}`);
    else if (memoryPanelRegex.test(content)) content = content.replace(memoryPanelRegex, `$1\n${insertLine}`);
    else if (debugPanelRegex.test(content)) content = content.replace(debugPanelRegex, `${insertLine}\n$1`);
    else {
      const mainClose = content.lastIndexOf("</main>");
      if (mainClose === -1) throw new Error("Keine sichere Render-Stelle in frontend/app/page.tsx gefunden.");
      content = content.slice(0, mainClose) + insertLine + "\n" + content.slice(mainClose);
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/page.tsx: ToolPreflightPanel eingebunden.");
  } else console.log("SKIP frontend/app/page.tsx: ToolPreflightPanel bereits eingebunden.");
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["tools:preflight:panel:verify"] = "node scripts/phase10-4-verify-tool-preflight-panel.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:preflight:panel:verify eingetragen.");
}

patchPage();
patchPackage();
console.log("Phase 10.4 Patch abgeschlossen.");
