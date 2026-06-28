const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "frontend", "app", "page.tsx");

if (!fs.existsSync(file)) {
  console.error("frontend/app/page.tsx wurde nicht gefunden.");
  process.exit(1);
}

let content = fs.readFileSync(file, "utf8");
const original = content;

const importLine = 'import { KnowledgeHitsPanel } from "../components/KnowledgeHitsPanel";';

if (!content.includes(importLine)) {
  const lines = content.split(/\r?\n/);
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex === -1) {
    console.error("Konnte Importbereich nicht finden.");
    process.exit(1);
  }

  lines.splice(lastImportIndex + 1, 0, importLine);
  content = lines.join("\n");
}

if (!content.includes("<KnowledgeHitsPanel response={response} />")) {
  const panelLine = "                <KnowledgeHitsPanel response={response} />";

  const routingRegex = /(\s*<RoutingMetadataPanel\b[^>]*\/>\s*)/m;
  const debugRegex = /(\s*<DebugResponsePanel\b[^>]*\/>\s*)/m;

  if (routingRegex.test(content)) {
    content = content.replace(routingRegex, `$1${panelLine}\n`);
  } else if (debugRegex.test(content)) {
    content = content.replace(debugRegex, `${panelLine}\n$1`);
  } else {
    const mainClose = content.lastIndexOf("</main>");
    if (mainClose === -1) {
      console.error("Konnte keine sichere Render-Stelle finden.");
      process.exit(1);
    }

    content =
      content.slice(0, mainClose) +
      panelLine +
      "\n" +
      content.slice(mainClose);
  }
}

if (content === original) {
  console.log("Keine Änderung nötig. KnowledgeHitsPanel ist bereits eingebunden.");
} else {
  fs.writeFileSync(file, content, "utf8");
  console.log("OK: frontend/app/page.tsx wurde um KnowledgeHitsPanel erweitert.");
}
