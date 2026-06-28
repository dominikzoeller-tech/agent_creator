const fs = require("fs");
const path = require("path");

const file = "frontend/app/api/analytics/route.ts";
const full = path.join(process.cwd(), file);

function read() { return fs.readFileSync(full, "utf8"); }
function write(content) { fs.writeFileSync(full, content, "utf8"); }

function findInterfaceBlock(lines, interfaceName) {
  const start = lines.findIndex((line) => new RegExp(`\\binterface\\s+${interfaceName}\\b`).test(line));
  if (start === -1) return null;

  let depth = 0;
  let seenOpen = false;
  for (let i = start; i < lines.length; i++) {
    const opens = (lines[i].match(/{/g) || []).length;
    const closes = (lines[i].match(/}/g) || []).length;
    if (opens > 0) seenOpen = true;
    depth += opens - closes;
    if (seenOpen && depth === 0) return { start, end: i };
  }
  return null;
}

function blockContains(lines, block, needle) {
  return lines.slice(block.start, block.end + 1).join("\n").includes(needle);
}

function patchDecisionLogEntry() {
  if (!fs.existsSync(full)) throw new Error(`${file} nicht gefunden.`);

  let content = read();
  const original = content;
  const lines = content.split(/\r?\n/);
  const block = findInterfaceBlock(lines, "DecisionLogEntry");

  if (!block) {
    throw new Error("interface DecisionLogEntry in frontend/app/api/analytics/route.ts nicht gefunden.");
  }

  if (!blockContains(lines, block, "toolEnforcement?:")) {
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
  }

  if (content !== original) {
    write(content);
    console.log("OK analytics route: toolEnforcement im lokalen DecisionLogEntry Interface ergänzt.");
  } else {
    console.log("SKIP analytics route: DecisionLogEntry enthält toolEnforcement bereits.");
  }
}

patchDecisionLogEntry();
console.log("Phase 11.1b Hotfix abgeschlossen.");
