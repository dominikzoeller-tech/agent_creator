const fs = require("fs");
const path = require("path");

const file = "frontend/app/api/analytics/route.ts";
const full = path.join(process.cwd(), file);

function read() { return fs.readFileSync(full, "utf8"); }
function write(content) { fs.writeFileSync(full, content, "utf8"); }

function findDecisionLogEntryBlock(lines) {
  const start = lines.findIndex((line) => /(?:interface|type)\s+DecisionLogEntry\b/.test(line));
  if (start === -1) return null;

  let braceDepth = 0;
  let seenOpeningBrace = false;

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;
    if (opens > 0) seenOpeningBrace = true;
    braceDepth += opens - closes;

    if (seenOpeningBrace && braceDepth === 0) {
      return { start, end: i };
    }
  }

  return null;
}

function patchDecisionLogEntryType() {
  if (!fs.existsSync(full)) {
    throw new Error(`${file} nicht gefunden.`);
  }

  let content = read();
  const original = content;

  if (content.includes("toolEnforcement?:")) {
    console.log("SKIP analytics route: toolEnforcement ist im DecisionLogEntry-Typ bereits vorhanden.");
    return;
  }

  const lines = content.split(/\r?\n/);
  const block = findDecisionLogEntryBlock(lines);
  if (!block) {
    throw new Error("DecisionLogEntry Interface/Type in frontend/app/api/analytics/route.ts nicht gefunden.");
  }

  const insert = [
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
  ];

  lines.splice(block.end, 0, ...insert);
  content = lines.join("\n");

  if (content !== original) {
    write(content);
    console.log("OK analytics route: toolEnforcement Feld im DecisionLogEntry-Typ ergänzt.");
  }
}

patchDecisionLogEntryType();
console.log("Phase 10.8b Hotfix abgeschlossen.");
