const fs = require("fs");
const path = require("path");
function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

function patchEnvExample() {
  const file = ".env.example";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes("WEB_RESEARCH_GOVERNANCE_ENABLED")) {
    content += "\n# Web Research Governance\nWEB_RESEARCH_GOVERNANCE_ENABLED=true\nWEB_RESEARCH_SAFE_MODE=true\nWEB_RESEARCH_SUMMARY_MODEL=\n";
  }
  if (content !== original) {
    write(file, content);
    console.log("OK .env.example: Web Research Governance Settings ergänzt.");
  } else console.log("SKIP .env.example: Settings bereits vorhanden.");
}

function patchNavigation() {
  const pages = [
    "frontend/app/page.tsx",
    "frontend/app/web-research/page.tsx",
    "frontend/app/web-research-save/page.tsx",
    "frontend/app/web-research-governance/page.tsx",
    "frontend/app/system/page.tsx",
  ];
  for (const file of pages) {
    if (!exists(file)) continue;
    let content = read(file);
    const original = content;
    if (!content.includes('href="/web-research-settings"')) {
      if (content.includes('href="/web-research-governance"')) {
        content = content.replace(/(<a className="nav-link" href="\/web-research-governance">Research Governance<\/a>)/, '$1\n        <a className="nav-link" href="/web-research-settings">Research Settings</a>');
      } else if (content.includes('href="/web-research"')) {
        content = content.replace(/(<a className="nav-link" href="\/web-research">Web Research<\/a>)/, '$1\n        <a className="nav-link" href="/web-research-settings">Research Settings</a>');
      } else if (content.includes('href="/system"')) {
        content = content.replace(/(<a className="nav-link" href="\/system">System<\/a>)/, '$1\n        <a className="nav-link" href="/web-research-settings">Research Settings</a>');
      }
    }
    if (content !== original) {
      write(file, content);
      console.log(`OK ${file}: Research Settings Navigation ergänzt.`);
    }
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["web:research:settings:patch"] = "node scripts/phase9-7-patch-web-research-settings.cjs";
  pkg.scripts["web:research:settings:verify"] = "node scripts/phase9-7-verify-web-research-settings.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: web:research:settings:* eingetragen.");
}

patchEnvExample();
patchNavigation();
patchPackage();
console.log("Phase 9.7 Patch abgeschlossen.");
