const fs = require("fs");
const path = require("path");

function check(file, patterns) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) { console.log(`MISS ${file}`); return false; }
  const content = fs.readFileSync(full, "utf8");
  let ok = true;
  for (const pattern of patterns) {
    const found = content.includes(pattern);
    console.log(`${found ? "OK  " : "MISS"} ${file}: ${pattern}`);
    if (!found) ok = false;
  }
  return ok;
}

console.log("======================================");
console.log(" Phase 9.9 Web Research Release Verify");
console.log("======================================");
let ok = true;
ok = check('docs/web-research-release-notes.md', ['Phase 9 Web Research Release Notes', '9.0', '9.9', 'Activation']) && ok;
ok = check('docs/web-research-activation-guide.md', ['Web Research Activation Guide', 'WEB_RESEARCH_ENABLED=true', 'BING_SEARCH_API_KEY', 'stack:health']) && ok;
ok = check('docs/phase9-completion-checklist.md', ['Phase 9 Completion Checklist', 'web:research:release:check', '.env nicht getrackt']) && ok;
ok = check('package.json', ['web:research:release:verify', 'web:research:release:check']) && ok;
ok = check('.env.example', ['WEB_RESEARCH_ENABLED', 'BING_SEARCH_API_KEY', 'WEB_RESEARCH_GOVERNANCE_ENABLED']) && ok;

const navFiles = [
  'frontend/app/page.tsx',
  'frontend/app/web-research/page.tsx',
  'frontend/app/web-research-settings/page.tsx',
];
for (const file of navFiles) {
  ok = check(file, ['href="/web-research"', 'href="/web-research-save"', 'href="/web-research-governance"', 'href="/web-research-settings"']) && ok;
}

if (!ok) { console.error('Verify fehlgeschlagen.'); process.exit(1); }
console.log('Verify OK. Web Research Release Polish ist vorbereitet.');
