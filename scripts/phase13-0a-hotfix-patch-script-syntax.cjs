const fs = require("fs");
const path = require("path");
const file = path.join(process.cwd(), "scripts", "phase13-0-patch-tool-adapter-registry-sandbox.cjs");
if (!fs.existsSync(file)) {
  console.error("phase13-0 Patch-Script nicht gefunden: " + file);
  process.exit(1);
}
let content = fs.readFileSync(file, "utf8");
const original = content;

// Phase 13.0a: repariert versehentlich als Text gespeicherte Escape-Sequenzen vor function patchPackage.
content = content.replace(/\}\\nfunction patchPackage\(\)\{/g, "}\nfunction patchPackage(){");
content = content.replace(/\}\\r\\nfunction patchPackage\(\)\{/g, "}\nfunction patchPackage(){");

// Repariert HTML-Entities, falls der Transport diese in das Script geschrieben hat.
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
  console.log("OK: phase13-0 Patch-Script repariert.");
} else {
  console.log("Keine Änderung am phase13-0 Patch-Script nötig oder Pattern nicht gefunden.");
}

try {
  new Function(content);
  console.log("OK: phase13-0 Patch-Script ist syntaktisch lesbar.");
} catch (error) {
  console.error("Patch-Script ist weiterhin syntaktisch defekt:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
