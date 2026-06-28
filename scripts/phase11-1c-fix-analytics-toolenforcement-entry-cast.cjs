const fs = require("fs");
const path = require("path");

const file = "frontend/app/api/analytics/route.ts";
const full = path.join(process.cwd(), file);

function read() { return fs.readFileSync(full, "utf8"); }
function write(content) { fs.writeFileSync(full, content, "utf8"); }

function findInterfaceEnd(lines, interfaceName) {
  const start = lines.findIndex((line) => new RegExp(`\\binterface\\s+${interfaceName}\\b`).test(line));
  if (start === -1) return -1;
  let depth = 0;
  let seenOpen = false;
  for (let i = start; i < lines.length; i++) {
    const opens = (lines[i].match(/{/g) || []).length;
    const closes = (lines[i].match(/}/g) || []).length;
    if (opens > 0) seenOpen = true;
    depth += opens - closes;
    if (seenOpen && depth === 0) return i;
  }
  return -1;
}

function patchAnalyticsEntryCast() {
  if (!fs.existsSync(full)) throw new Error(`${file} nicht gefunden.`);
  let content = read();
  const original = content;

  if (!content.includes("type DecisionLogEntryWithToolEnforcement")) {
    const lines = content.split(/\r?\n/);
    const end = findInterfaceEnd(lines, "DecisionLogEntry");
    if (end === -1) throw new Error("interface DecisionLogEntry nicht gefunden.");

    const alias = [
      "",
      "type DecisionLogEntryWithToolEnforcement = DecisionLogEntry & {",
      "  toolEnforcement?: {",
      "    enabled?: boolean;",
      "    dryRun?: boolean;",
      "    wouldBlock?: boolean;",
      "    blockedToolIds?: string[];",
      "    allowedToolIds?: string[];",
      "    confirmationRequiredToolIds?: string[];",
      "    reasons?: string[];",
      "    warnings?: string[];",
      "    mode?: string;",
      "  };",
      "};",
    ];
    lines.splice(end + 1, 0, ...alias);
    content = lines.join("\n");
  }

  const oldLine = "    const toolEnforcementEntries = entries.filter((entry) => Boolean(entry.toolEnforcement));";
  const newLines = "    const entriesWithToolEnforcement = entries as DecisionLogEntryWithToolEnforcement[];\n    const toolEnforcementEntries = entriesWithToolEnforcement.filter((entry) => Boolean(entry.toolEnforcement));";

  if (content.includes(oldLine)) {
    content = content.replace(oldLine, newLines);
  }

  if (content !== original) {
    write(content);
    console.log("OK analytics route: DecisionLogEntryWithToolEnforcement Cast ergänzt.");
  } else {
    console.log("SKIP analytics route: Cast Fix bereits vorhanden oder Zielzeile nicht gefunden.");
  }
}

patchAnalyticsEntryCast();
console.log("Phase 11.1c Hotfix abgeschlossen.");
