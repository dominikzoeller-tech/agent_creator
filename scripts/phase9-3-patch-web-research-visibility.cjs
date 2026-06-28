const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchTypes() {
  const file = "frontend/lib/types.ts";
  let content = read(file);
  const original = content;

  if (!content.includes("export interface WebResearchResult")) {
    const webTypes = `
export interface WebResearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface WebResearchSource {
  title: string;
  url: string;
  source?: string;
}
`;
    const insertAfter = content.includes("export interface ProjectMemoryEntry")
      ? content.indexOf("export interface ProjectMemoryEntry")
      : -1;

    if (insertAfter >= 0) {
      content = content.slice(0, insertAfter) + webTypes + "\n" + content.slice(insertAfter);
    } else {
      content += "\n" + webTypes;
    }
  }

  const fields = [
    "usedWebResearch?: boolean;",
    "webResearchEnabled?: boolean;",
    "webResearchQuery?: string;",
    "webResearchMessage?: string;",
    "webResearchResults?: WebResearchResult[];",
    "usedWebResearchSummary?: boolean;",
    "webResearchSummary?: string;",
    "webResearchSummaryMessage?: string;",
    "webResearchSources?: WebResearchSource[];",
  ];

  if (!content.includes("usedWebResearch?: boolean;")) {
    const marker = "  memoryHits?: ProjectMemoryEntry[];\n}";
    if (content.includes(marker)) {
      content = content.replace(marker, "  memoryHits?: ProjectMemoryEntry[];\n  " + fields.join("\n  ") + "\n}");
    } else {
      const fallback = "  councilResult?: unknown;\n}";
      if (content.includes(fallback)) {
        content = content.replace(fallback, "  councilResult?: unknown;\n  " + fields.join("\n  ") + "\n}");
      } else {
        console.log("INFO frontend/lib/types.ts: Kein bekannter AgentResult Marker gefunden; WebResearch-Typen wurden dennoch ergänzt.");
      }
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: Web-Research-Typen ergänzt.");
  } else {
    console.log("SKIP frontend/lib/types.ts: Web-Research-Typen bereits vorhanden.");
  }
}

function patchPage() {
  const file = "frontend/app/page.tsx";
  let content = read(file);
  const original = content;

  const importLine = 'import { WebResearchPanel } from "../components/WebResearchPanel";';
  if (!content.includes(importLine)) {
    const lines = content.split(/\r?\n/);
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImport = i;
    if (lastImport === -1) throw new Error("Importbereich in frontend/app/page.tsx nicht gefunden.");
    lines.splice(lastImport + 1, 0, importLine);
    content = lines.join("\n");
  }

  if (!content.includes("<WebResearchPanel response={response} />")) {
    const insertLine = "                <WebResearchPanel response={response} />";
    const memoryPanelRegex = /^(\s*<MemoryHitsPanel\s+response=\{response\}\s*\/>)\s*$/m;
    const knowledgePanelRegex = /^(\s*<KnowledgeHitsPanel\s+response=\{response\}\s*\/>)\s*$/m;
    const debugPanelRegex = /^(\s*<DebugResponsePanel\b[^>]*\/>)\s*$/m;

    if (memoryPanelRegex.test(content)) content = content.replace(memoryPanelRegex, `$1\n${insertLine}`);
    else if (knowledgePanelRegex.test(content)) content = content.replace(knowledgePanelRegex, `$1\n${insertLine}`);
    else if (debugPanelRegex.test(content)) content = content.replace(debugPanelRegex, `${insertLine}\n$1`);
    else {
      const mainClose = content.lastIndexOf("</main>");
      if (mainClose === -1) throw new Error("Keine sichere Stelle zum Rendern des WebResearchPanel gefunden.");
      content = content.slice(0, mainClose) + insertLine + "\n" + content.slice(mainClose);
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/page.tsx: WebResearchPanel eingebunden.");
  } else {
    console.log("SKIP frontend/app/page.tsx: WebResearchPanel bereits eingebunden.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["web:research:visibility:patch"] = "node scripts/phase9-3-patch-web-research-visibility.cjs";
  pkg.scripts["web:research:visibility:verify"] = "node scripts/phase9-3-verify-web-research-visibility.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: web:research:visibility:* eingetragen.");
}

patchTypes();
patchPage();
patchPackage();
console.log("Phase 9.3 Patch abgeschlossen.");
