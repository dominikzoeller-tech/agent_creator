const fs = require("fs");

const file = "scripts/phase7-9-patch-knowledge-search-tuning.cjs";

let content = fs.readFileSync(file, "utf8");
const lines = content.split(/\r?\n/);

let changed = false;

const fixedLine =
'  return (start > 0 ? "..." : "") + compact.slice(start, end) + (end < compact.length ? "..." : "");';

const fixed = lines.map((line) => {
  if (
    line.includes("return `${start") ||
    (line.includes("compact.slice(start, end)") && line.includes("compact.length"))
  ) {
    changed = true;
    return fixedLine;
  }

  return line;
});

if (!changed) {
  console.log("Keine passende kaputte return-Zeile gefunden.");
} else {
  fs.writeFileSync(file, fixed.join("\n"), "utf8");
  console.log("OK: Kaputte Template-String-Zeile in phase7-9 Patch-Script repariert.");
}
