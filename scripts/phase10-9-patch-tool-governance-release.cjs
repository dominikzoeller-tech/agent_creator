const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["tools:governance:release:verify"] = "node scripts/phase10-9-verify-tool-governance-release.cjs";
  pkg.scripts["tools:governance:smoke"] = "node scripts/phase10-9-tool-governance-smoke.cjs";
  pkg.scripts["tools:governance:release:check"] = "npm run tools:governance:release:verify && npm run tools:governance:smoke";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:governance:* Scripts eingetragen.");
}

function patchReadme() {
  const file = "README.md";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes("## Phase 10 Tool Governance")) {
    content += `

## Phase 10 Tool Governance

Phase 10 führt eine sichtbare und messbare Tool Governance ein.

Wichtige Seiten:

- \`/tools\` – Tool Registry
- \`/tool-permissions\` – Permissions Matrix
- \`/tool-preflight\` – Einzelner Preflight
- \`/analytics\` – Preflight- und Enforcement-Analytics

Wichtige Checks:

\`\`\`powershell
npm run tools:governance:release:verify
npm run tools:governance:smoke
\`\`\`

Harte Enforcement-Blockade ist in Phase 10 noch nicht standardmäßig aktiv.
`;
  }
  if (content !== original) {
    write(file, content);
    console.log("OK README.md: Phase 10 Tool Governance Abschnitt ergänzt.");
  } else console.log("SKIP README.md: Phase 10 Abschnitt bereits vorhanden.");
}

patchPackage();
patchReadme();
console.log("Phase 10.9 Patch abgeschlossen.");
