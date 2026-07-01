const fs = require("fs");
const path = require("path");
const file = path.join(process.cwd(), "scripts", "phase11-4-patch-missing-tool-capability-request-flow.cjs");
if (!fs.existsSync(file)) {
  console.error("phase11-4 Patch-Script nicht gefunden: " + file);
  process.exit(1);
}
let content = fs.readFileSync(file, "utf8");
const original = content;
// 1) Nested Template Literal im eingebetteten TSX-String entschärfen.
// Fehler war: decisionNote: `UI decision: ${status}` innerhalb eines über Backticks definierten CJS-Strings.
content = content.replace(/decisionNote:\s*`UI decision:\s*\$\{status\}`/g, 'decisionNote: "UI decision: "+status');
// Falls die Zeichen durch Transport/Sanitizer als HTML Entities im Script gelandet sind, im Patch-Script reparieren.
// Wichtig: Das Patch-Script soll echte TSX-Zeichen in die Ziel-Dateien schreiben, nicht &lt; / &gt;.
for (let i = 0; i < 3; i++) {
  content = content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
// 2) Import-Marker robuster machen, falls Phase 11.3 Import anders heißt.
content = content.replace(
  'const marker=\'import { createToolConsentRequest, getAgentFlowToolConsentRequest } from "./tool-consent-agent-flow";\'; if(content.includes(marker)) content=content.replace(marker, marker+"\\n"+importLine); else content=content.replace(/import \\{ createAgentFlowToolConsentRequest[^\\n]+\\n/, m=>m+importLine+"\\n");',
  'const marker1=\'import { createAgentFlowToolConsentRequest, getAgentFlowToolConsentRequest } from "./tool-consent-agent-flow";\'; const marker2=\'import { createAgentFlowToolConsentRequest } from "./tool-consent-agent-flow";\'; if(content.includes(marker1)) content=content.replace(marker1, marker1+"\\n"+importLine); else if(content.includes(marker2)) content=content.replace(marker2, marker2+"\\n"+importLine); else content=content.replace(/import \\{ createAgentFlowToolConsentRequest[^\\n]+\\n/, m=>m+importLine+"\\n");'
);
if (content === original) {
  console.log("Keine Änderung nötig oder Pattern nicht gefunden. Prüfe trotzdem Syntax...");
} else {
  fs.writeFileSync(file, content, "utf8");
  console.log("OK: phase11-4 Patch-Script repariert.");
}
// 3) Syntax-Check ohne Ausführen des Patch-Scripts.
try {
  new Function(content);
  console.log("OK: phase11-4 Patch-Script ist syntaktisch lesbar.");
} catch (error) {
  console.error("Patch-Script ist weiterhin syntaktisch defekt:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
