const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchSaveApi() {
  const file = "frontend/app/api/web-research-save/route.ts";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  const importLine = 'import { evaluateWebResearchGovernance } from "../../../lib/web-research-governance";';
  if (!content.includes(importLine)) {
    content = importLine + "\n" + content;
  }
  if (!content.includes("const governance = evaluateWebResearchGovernance")) {
    content = content.replace(
      "    const body = await request.json();\n    const result = await saveWebResearch(body);",
      "    const body = await request.json();\n    const governance = evaluateWebResearchGovernance(body);\n    if (!governance.allowed) {\n      return Response.json({ ok: false, error: \"Web Research Governance blockiert die Speicherung. Bitte Issues prüfen.\", governance }, { status: 400 });\n    }\n    const result = await saveWebResearch({ ...body, sources: governance.deduplicatedSources });"
    );
  }
  if (content !== original) {
    write(file, content);
    console.log("OK web-research-save API: Governance Gate ergänzt.");
  } else console.log("SKIP web-research-save API: Governance Gate bereits vorhanden.");
}

function patchNavigation() {
  const pages = ["frontend/app/web-research-save/page.tsx", "frontend/app/web-research/page.tsx", "frontend/app/page.tsx"];
  for (const file of pages) {
    if (!exists(file)) continue;
    let content = read(file);
    const original = content;
    if (!content.includes('href="/web-research-governance"')) {
      if (content.includes('href="/web-research-save"')) {
        content = content.replace(/(<a className="nav-link" href="\/web-research-save">Research speichern<\/a>)/, '$1\n        <a className="nav-link" href="/web-research-governance">Research Governance</a>');
      } else if (content.includes('href="/web-research"')) {
        content = content.replace(/(<a className="nav-link" href="\/web-research">Web Research<\/a>)/, '$1\n        <a className="nav-link" href="/web-research-governance">Research Governance</a>');
      }
    }
    if (content !== original) {
      write(file, content);
      console.log(`OK ${file}: Governance Navigation ergänzt.`);
    }
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["web:research:governance:patch"] = "node scripts/phase9-6-patch-web-research-governance.cjs";
  pkg.scripts["web:research:governance:verify"] = "node scripts/phase9-6-verify-web-research-governance.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: web:research:governance:* eingetragen.");
}

patchSaveApi();
patchNavigation();
patchPackage();
console.log("Phase 9.6 Patch abgeschlossen.");
