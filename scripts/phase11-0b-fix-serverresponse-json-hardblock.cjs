const fs = require("fs");
const path = require("path");

const file = "server.ts";
const full = path.join(process.cwd(), file);

function read() { return fs.readFileSync(full, "utf8"); }
function write(content) { fs.writeFileSync(full, content, "utf8"); }

function patchServerResponseJson() {
  if (!fs.existsSync(full)) throw new Error(`${file} nicht gefunden.`);
  let content = read();
  const original = content;

  const oldBlock = `  if (toolEnforcement.hardBlocked) {
    return res.json({
      ok: true,
      mode: "cloud",
      result: {
        answer: "Diese Anfrage wurde durch Tool Permission Enforcement blockiert. Bitte Sensitivity, Processing Mode oder Tool-Anfrage prüfen.",
        toolPreflight,
        toolEnforcement,
      },
    });
  }

`;

  const newBlock = `  if (toolEnforcement.hardBlocked) {
    const payload = {
      ok: true,
      mode: "cloud",
      result: {
        answer: "Diese Anfrage wurde durch Tool Permission Enforcement blockiert. Bitte Sensitivity, Processing Mode oder Tool-Anfrage prüfen.",
        toolPreflight,
        toolEnforcement,
      },
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
    return;
  }

`;

  if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
  } else if (content.includes("toolEnforcement.hardBlocked") && content.includes("return res.json")) {
    content = content.replace(/  if \(toolEnforcement\.hardBlocked\) \{[\s\S]*?return res\.json\(([\s\S]*?)\);\n  \}\n\n/, newBlock);
  }

  if (content === original) {
    console.log("SKIP server.ts: Kein res.json HardBlock gefunden oder bereits gefixt.");
    return;
  }

  write(content);
  console.log("OK server.ts: res.json durch res.writeHead/res.end ersetzt.");
}

patchServerResponseJson();
console.log("Phase 11.0b Hotfix abgeschlossen.");
