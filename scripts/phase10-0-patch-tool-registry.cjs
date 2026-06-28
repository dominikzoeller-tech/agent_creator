const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchNavigation() {
  const pages = ["frontend/app/page.tsx", "frontend/app/system/page.tsx", "frontend/app/web-research-settings/page.tsx", "frontend/app/analytics/page.tsx"];
  for (const file of pages) {
    if (!exists(file)) continue;
    let content = read(file);
    const original = content;
    if (!content.includes('href="/tools"')) {
      if (content.includes('href="/system"')) {
        content = content.replace(/(<a className="nav-link" href="\/system">System<\/a>)/, '$1\n        <a className="nav-link" href="/tools">Tools</a>');
      } else {
        const navEnd = content.indexOf("</nav>");
        if (navEnd >= 0) content = content.slice(0, navEnd) + '        <a className="nav-link" href="/tools">Tools</a>\n      ' + content.slice(navEnd);
      }
    }
    if (content !== original) {
      write(file, content);
      console.log(`OK ${file}: Tools Navigation ergänzt.`);
    }
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["tools:registry:verify"] = "node scripts/phase10-0-verify-tool-registry.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:registry:verify eingetragen.");
}

patchNavigation();
patchPackage();
console.log("Phase 10.0 Patch abgeschlossen.");
