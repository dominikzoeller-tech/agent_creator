const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

const pages = [
  "frontend/app/page.tsx",
  "frontend/app/analytics/page.tsx",
  "frontend/app/memory/page.tsx",
  "frontend/app/memory-quality/page.tsx",
  "frontend/app/memory-sessions/page.tsx",
];

function patchNav(file) {
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes('href="/memory-sessions"')) {
    if (content.includes('href="/memory-quality"')) {
      content = content.replace(
        /(<a className="nav-link" href="\/memory-quality">Memory Quality<\/a>)/,
        '$1\n        <a className="nav-link" href="/memory-sessions">Session Summary</a>'
      );
    } else if (content.includes('href="/memory"')) {
      content = content.replace(
        /(<a className="nav-link" href="\/memory">Memory(?: Admin)?<\/a>)/,
        '$1\n        <a className="nav-link" href="/memory-sessions">Session Summary</a>'
      );
    }
  }
  if (content !== original) {
    write(file, content);
    console.log(`OK ${file}: Session Summary Navigation ergänzt.`);
  } else {
    console.log(`SKIP ${file}: Navigation bereits passend oder kein Marker.`);
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["memory:sessions:ux:patch"] = "node scripts/phase8-9-patch-memory-session-ux.cjs";
  pkg.scripts["memory:sessions:ux:verify"] = "node scripts/phase8-9-verify-memory-session-ux.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: memory:sessions:ux:* eingetragen.");
}

for (const page of pages) patchNav(page);
patchPackage();
console.log("Phase 8.9 Patch abgeschlossen.");
