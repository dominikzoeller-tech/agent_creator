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
  if (!content.includes("WEB_RESEARCH_ENABLED")) {
    content += "\n# Web Research Foundation\nWEB_RESEARCH_ENABLED=false\nBING_SEARCH_API_KEY=\nBING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search\n";
  }
  if (content !== original) {
    write(file, content);
    console.log("OK .env.example: Web Research Variablen ergänzt.");
  } else console.log("SKIP .env.example: Web Research Variablen bereits vorhanden.");
}

function patchCompose() {
  const file = "docker-compose.internal.yml";
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  const marker = "      NEXT_PUBLIC_AGENT_API_BASE_URL: http://localhost:7071\n";
  if (content.includes(marker) && !content.includes("WEB_RESEARCH_ENABLED:")) {
    content = content.replace(marker, marker + "      WEB_RESEARCH_ENABLED: ${WEB_RESEARCH_ENABLED:-false}\n      BING_SEARCH_API_KEY: ${BING_SEARCH_API_KEY:-}\n      BING_SEARCH_ENDPOINT: ${BING_SEARCH_ENDPOINT:-https://api.bing.microsoft.com/v7.0/search}\n");
  }
  if (content !== original) {
    write(file, content);
    console.log("OK docker-compose.internal.yml: Web Research env fürs Frontend ergänzt.");
  } else console.log("SKIP docker-compose.internal.yml: Web Research env bereits vorhanden oder Marker fehlt.");
}

function patchNavigation() {
  const pages = ["frontend/app/page.tsx", "frontend/app/system/page.tsx", "frontend/app/analytics/page.tsx"];
  for (const file of pages) {
    if (!exists(file)) continue;
    let content = read(file);
    const original = content;
    if (!content.includes('href="/web-research"')) {
      if (content.includes('href="/system"')) {
        content = content.replace(/(<a className="nav-link" href="\/system">System<\/a>)/, '$1\n        <a className="nav-link" href="/web-research">Web Research</a>');
      } else if (content.includes('href="/analytics"')) {
        content = content.replace(/(<a className="nav-link" href="\/analytics">Analytics<\/a>)/, '$1\n        <a className="nav-link" href="/web-research">Web Research</a>');
      }
    }
    if (content !== original) {
      write(file, content);
      console.log(`OK ${file}: Web Research Navigation ergänzt.`);
    }
  }
}

function patchPackage() {
  const file = "package.json";
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["web:research:verify"] = "node scripts/phase9-0-verify-web-research-foundation.cjs";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("OK package.json: web:research:verify eingetragen.");
}

patchEnvExample();
patchCompose();
patchNavigation();
patchPackage();
console.log("Phase 9.0 Patch abgeschlossen.");
