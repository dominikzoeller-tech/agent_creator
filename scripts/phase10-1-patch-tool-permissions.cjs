const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchNavigation() {
  const pages = ["frontend/app/page.tsx", "frontend/app/tools/page.tsx", "frontend/app/system/page.tsx"];
  for (const file of pages) {
    if (!exists(file)) continue;
    let content = read(file);
    const original = content;
    if (!content.includes('href="/tool-permissions"')) {
      if (content.includes('href="/tools"')) {
        content = content.replace(/(<a className="nav-link" href="\/tools">Tools<\/a>)/, '$1\n        <a className="nav-link" href="/tool-permissions">Tool Permissions</a>');
      } else {
        const navEnd = content.indexOf("</nav>");
        if (navEnd >= 0) content = content.slice(0, navEnd) + '        <a className="nav-link" href="/tool-permissions">Tool Permissions</a>\n      ' + content.slice(navEnd);
      }
    }
    if (content !== original) {
      write(file, content);
      console.log(`OK ${file}: Tool Permissions Navigation ergänzt.`);
    }
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["tools:permissions:verify"] = "node scripts/phase10-1-verify-tool-permissions.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: tools:permissions:verify eingetragen.");
}

patchNavigation();
patchPackage();
console.log("Phase 10.1 Patch abgeschlossen.");
