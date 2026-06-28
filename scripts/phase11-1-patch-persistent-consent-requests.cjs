const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchNavigation() {
  const pages = ["frontend/app/page.tsx", "frontend/app/tools/page.tsx", "frontend/app/tool-permissions/page.tsx", "frontend/app/tool-preflight/page.tsx", "frontend/app/system/page.tsx"];
  for (const file of pages) {
    if (!exists(file)) continue;
    let content = read(file);
    const original = content;
    if (!content.includes('href="/tool-consent"')) {
      if (content.includes('href="/tool-preflight"')) {
        content = content.replace(/(<a className="nav-link" href="\/tool-preflight">Tool Preflight<\/a>)/, '$1\n        <a className="nav-link" href="/tool-consent">Tool Consent</a>');
      } else if (content.includes('href="/tools"')) {
        content = content.replace(/(<a className="nav-link" href="\/tools">Tools<\/a>)/, '$1\n        <a className="nav-link" href="/tool-consent">Tool Consent</a>');
      }
    }
    if (content !== original) {
      write(file, content);
      console.log(`OK ${file}: Tool Consent Navigation ergänzt.`);
    }
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["tools:consent:verify"] = "node scripts/phase11-1-verify-persistent-consent-requests.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:consent:verify eingetragen.");
}

patchNavigation();
patchPackage();
console.log("Phase 11.1 Patch abgeschlossen.");
