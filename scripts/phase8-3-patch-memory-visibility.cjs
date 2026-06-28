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

  if (!content.includes("export interface ProjectMemoryEntry")) {
    const insertAfter = content.includes("export interface KnowledgeSearchResult")
      ? content.indexOf("export interface KnowledgeSearchResult")
      : -1;

    const memoryType = `
export type ProjectMemoryType =
  | "decision"
  | "milestone"
  | "issue"
  | "preference"
  | "system-state"
  | "note";

export interface ProjectMemoryEntry {
  id: string;
  type: ProjectMemoryType;
  title: string;
  summary: string;
  tags: string[];
  source?: string;
  createdAt: string;
  updatedAt: string;
}
`;

    if (insertAfter >= 0) {
      content = content.slice(0, insertAfter) + memoryType + "\n" + content.slice(insertAfter);
    } else {
      content += "\n" + memoryType;
    }
  }

  if (!content.includes("usedMemory?: boolean;")) {
    const marker = "  knowledgeHits?: KnowledgeSearchResult[];\n}";
    if (content.includes(marker)) {
      content = content.replace(marker, marker.replace("\n}", "\n  usedMemory?: boolean;\n  memorySummary?: string;\n  memoryHits?: ProjectMemoryEntry[];\n}"));
    } else {
      const fallback = "  councilResult?: unknown;\n}";
      if (content.includes(fallback)) {
        content = content.replace(
          fallback,
          "  councilResult?: unknown;\n  usedMemory?: boolean;\n  memorySummary?: string;\n  memoryHits?: ProjectMemoryEntry[];\n}"
        );
      } else {
        console.log("INFO frontend/lib/types.ts: Kein bekannter AgentResult Marker gefunden. Typen für MemoryEntry wurden dennoch ergänzt.");
      }
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/lib/types.ts: Project-Memory-Typen ergänzt.");
  } else {
    console.log("SKIP frontend/lib/types.ts: Project-Memory-Typen bereits vorhanden.");
  }
}

function patchPage() {
  const file = "frontend/app/page.tsx";
  let content = read(file);
  const original = content;

  const importLine = 'import { MemoryHitsPanel } from "../components/MemoryHitsPanel";';
  if (!content.includes(importLine)) {
    const knowledgeImport = 'import { KnowledgeHitsPanel } from "../components/KnowledgeHitsPanel";\n';
    if (content.includes(knowledgeImport)) {
      content = content.replace(knowledgeImport, knowledgeImport + importLine + "\n");
    } else {
      const lines = content.split(/\r?\n/);
      let lastImport = -1;
      for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImport = i;
      if (lastImport === -1) throw new Error("Importbereich in frontend/app/page.tsx nicht gefunden.");
      lines.splice(lastImport + 1, 0, importLine);
      content = lines.join("\n");
    }
  }

  if (!content.includes("<MemoryHitsPanel response={response} />")) {
    const insertLine = "                <MemoryHitsPanel response={response} />";
    const knowledgePanelRegex = /^(\s*<KnowledgeHitsPanel\s+response=\{response\}\s*\/>)\s*$/m;
    const debugPanelRegex = /^(\s*<DebugResponsePanel\b[^>]*\/>)\s*$/m;

    if (knowledgePanelRegex.test(content)) {
      content = content.replace(knowledgePanelRegex, `$1\n${insertLine}`);
    } else if (debugPanelRegex.test(content)) {
      content = content.replace(debugPanelRegex, `${insertLine}\n$1`);
    } else {
      const mainClose = content.lastIndexOf("</main>");
      if (mainClose === -1) throw new Error("Keine sichere Stelle zum Rendern des MemoryHitsPanel gefunden.");
      content = content.slice(0, mainClose) + insertLine + "\n" + content.slice(mainClose);
    }
  }

  if (content !== original) {
    write(file, content);
    console.log("OK frontend/app/page.tsx: MemoryHitsPanel eingebunden.");
  } else {
    console.log("SKIP frontend/app/page.tsx: MemoryHitsPanel bereits eingebunden.");
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["memory:visibility:patch"] = "node scripts/phase8-3-patch-memory-visibility.cjs";
  pkg.scripts["memory:visibility:verify"] = "node scripts/phase8-3-verify-memory-visibility.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: memory:visibility:patch und memory:visibility:verify eingetragen.");
}

patchTypes();
patchPage();
patchPackage();
console.log("Phase 8.3 Patch abgeschlossen.");
