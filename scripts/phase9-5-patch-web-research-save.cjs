const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchCompose() {
  const file = "docker-compose.internal.yml";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes("./knowledge:/knowledge")) console.log("INFO docker-compose.internal.yml: Frontend Knowledge Volume nicht gefunden.");
  if (!content.includes("./memory:/memory")) console.log("INFO docker-compose.internal.yml: Frontend Memory Volume nicht gefunden.");
  if (content !== original) write(file, content);
}

function patchNavigation() {
  const pages = ["frontend/app/page.tsx", "frontend/app/web-research/page.tsx", "frontend/app/knowledge/page.tsx", "frontend/app/memory/page.tsx"];
  for (const file of pages) {
    if (!exists(file)) continue;
    let content = read(file);
    const original = content;
    if (!content.includes('href="/web-research-save"')) {
      if (content.includes('href="/web-research"')) {
        content = content.replace(/(<a className="nav-link" href="\/web-research">Web Research<\/a>)/, '$1\n        <a className="nav-link" href="/web-research-save">Research speichern</a>');
      } else if (content.includes('href="/knowledge"')) {
        content = content.replace(/(<a className="nav-link" href="\/knowledge">Knowledge<\/a>)/, '$1\n        <a className="nav-link" href="/web-research-save">Research speichern</a>');
      }
    }
    if (content !== original) {
      write(file, content);
      console.log(`OK ${file}: Research speichern Navigation ergänzt.`);
    }
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["web:research:save:patch"] = "node scripts/phase9-5-patch-web-research-save.cjs";
  pkg.scripts["web:research:save:verify"] = "node scripts/phase9-5-verify-web-research-save.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: web:research:save:* eingetragen.");
}

patchCompose();
patchNavigation();
patchPackage();
console.log("Phase 9.5 Patch abgeschlossen.");
