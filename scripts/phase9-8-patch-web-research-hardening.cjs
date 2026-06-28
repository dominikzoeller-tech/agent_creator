const fs = require("fs");
const path = require("path");
function read(file) { return fs.readFileSync(path.join(process.cwd(), file), "utf8"); }
function write(file, content) { fs.writeFileSync(path.join(process.cwd(), file), content, "utf8"); }
function exists(file) { return fs.existsSync(path.join(process.cwd(), file)); }

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["web:research:hardening:verify"] = "node scripts/phase9-8-verify-web-research-hardening.cjs";
  pkg.scripts["web:research:smoke"] = "node scripts/phase9-8-web-research-smoke.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: web:research:hardening:verify und web:research:smoke eingetragen.");
}

function patchReadme() {
  const file = "README.md";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes("## Web Research Hardening")) {
    content += `

## Web Research Hardening

Web Research ist standardmäßig deaktiviert und wird über Environment-Variablen gesteuert.
API-Keys dürfen nicht in Logs, Screenshots oder API-Responses ausgegeben werden.

Wichtige Checks:

\`\`\`powershell
npm run web:research:hardening:verify
npm run web:research:smoke
\`\`\`

Die Smoke Tests prüfen:

- Web Research API Baseline
- Governance Checks
- Settings ohne Secret-Leaks
- Save API blockiert unsichere Payloads
`;
  }
  if (content !== original) {
    write(file, content);
    console.log("OK README.md: Web Research Hardening Abschnitt ergänzt.");
  } else console.log("SKIP README.md: Hardening Abschnitt bereits vorhanden.");
}

patchPackage();
patchReadme();
console.log("Phase 9.8 Patch abgeschlossen.");
