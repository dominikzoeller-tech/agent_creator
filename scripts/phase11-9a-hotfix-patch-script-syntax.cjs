const fs = require("fs");
const path = require("path");
const file = path.join(process.cwd(), "scripts", "phase11-9-patch-governance-release-polish.cjs");
if (!fs.existsSync(file)) {
  console.error("phase11-9 Patch-Script nicht gefunden: " + file);
  process.exit(1);
}
let content = fs.readFileSync(file, "utf8");
const original = content;

// Phase 11.9a: nested Template Literals im eingebetteten Smoke-Script entschärfen.
// Ursache: Das Patch-Script definiert smokeScript als String.raw`...`; darin dürfen keine unescaped `...${...}` Template Literals stehen.
content = content
  .replace(/console\.log\(`\$\{good \? "OK  " : "MISS"\} \$\{label\}: \$\{res\.status\} \$\{url\}`\);/g,
    'console.log((good ? "OK  " : "MISS") + " " + label + ": " + res.status + " " + url);')
  .replace(/console\.log\(`MISS \$\{label\}: \$\{url\}`\);/g,
    'console.log("MISS " + label + ": " + url);');

// Falls der Transport HTML-Entities in das Script geschrieben hat, reparieren.
for (let i = 0; i < 3; i++) {
  content = content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

if (content !== original) {
  fs.writeFileSync(file, content, "utf8");
  console.log("OK: phase11-9 Patch-Script repariert.");
} else {
  console.log("Keine Änderung am phase11-9 Patch-Script nötig oder Pattern nicht gefunden.");
}

try {
  new Function(content);
  console.log("OK: phase11-9 Patch-Script ist syntaktisch lesbar.");
} catch (error) {
  console.error("Patch-Script ist weiterhin syntaktisch defekt:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
