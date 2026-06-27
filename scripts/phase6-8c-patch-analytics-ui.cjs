const fs = require("fs");
const path = require("path");

const pagePath = path.join(process.cwd(), "frontend", "app", "analytics", "page.tsx");

if (!fs.existsSync(pagePath)) {
  console.error("frontend/app/analytics/page.tsx wurde nicht gefunden.");
  process.exit(1);
}

let content = fs.readFileSync(pagePath, "utf8");
const original = content;

const importLine = 'import { AgentRoutingAnalyticsPanel } from "../../components/AgentRoutingAnalyticsPanel";';
if (!content.includes(importLine)) {
  // Insert after the last import line.
  const lines = content.split(/\r?\n/);
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) lastImportIndex = i;
  }
  if (lastImportIndex === -1) {
    console.error("Konnte Importbereich in analytics/page.tsx nicht finden.");
    process.exit(1);
  }
  lines.splice(lastImportIndex + 1, 0, importLine);
  content = lines.join("\n");
}

if (!content.includes("<AgentRoutingAnalyticsPanel")) {
  // Try to insert before the last closing </main>.
  const mainClose = content.lastIndexOf("</main>");
  if (mainClose !== -1) {
    const insertion = `\n        <AgentRoutingAnalyticsPanel analytics={analytics} />\n`;
    content = content.slice(0, mainClose) + insertion + content.slice(mainClose);
  } else {
    // Fallback: insert before final return wrapper close if main is not present.
    const shellClose = content.lastIndexOf("</div>");
    if (shellClose === -1) {
      console.error("Konnte keinen sicheren Einfügepunkt für AgentRoutingAnalyticsPanel finden.");
      process.exit(1);
    }
    const insertion = `\n      <AgentRoutingAnalyticsPanel analytics={analytics} />\n`;
    content = content.slice(0, shellClose) + insertion + content.slice(shellClose);
  }
}

if (content === original) {
  console.log("Keine Änderung nötig. Analytics-Seite enthält das AgentRoutingAnalyticsPanel bereits.");
} else {
  fs.writeFileSync(pagePath, content, "utf8");
  console.log("frontend/app/analytics/page.tsx wurde um AgentRoutingAnalyticsPanel erweitert.");
}
