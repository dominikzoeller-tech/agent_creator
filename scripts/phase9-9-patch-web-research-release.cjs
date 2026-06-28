const fs = require("fs");
const path = require("path");

function full(file) { return path.join(process.cwd(), file); }
function exists(file) { return fs.existsSync(full(file)); }
function read(file) { return fs.readFileSync(full(file), "utf8"); }
function write(file, content) { fs.writeFileSync(full(file), content, "utf8"); }

const navLinks = [
  ['/', 'Chat'],
  ['/web-research', 'Web Research'],
  ['/web-research-save', 'Research speichern'],
  ['/web-research-governance', 'Research Governance'],
  ['/web-research-settings', 'Research Settings'],
  ['/analytics', 'Analytics'],
  ['/system', 'System'],
];

function buildLink([href, label]) {
  return `<a className="nav-link" href="${href}">${label}</a>`;
}

function patchNavigation(file) {
  if (!exists(file)) return;
  let content = read(file);
  const original = content;

  const missing = navLinks.filter(([href]) => !content.includes(`href="${href}"`));
  if (missing.length === 0) {
    console.log(`SKIP ${file}: Web Research Navigation vollständig.`);
    return;
  }

  const navStart = content.indexOf('<nav');
  const navEnd = content.indexOf('</nav>', navStart);
  if (navStart >= 0 && navEnd > navStart) {
    const navBlock = content.slice(navStart, navEnd + '</nav>'.length);
    const insertion = missing.map(buildLink).join('\n        ');
    const patchedNav = navBlock.replace('</nav>', `        ${insertion}\n      </nav>`);
    content = content.slice(0, navStart) + patchedNav + content.slice(navEnd + '</nav>'.length);
  } else {
    const mainMatch = content.match(/<main[^>]*>/);
    if (!mainMatch || mainMatch.index === undefined) {
      console.log(`INFO ${file}: kein <main> gefunden.`);
      return;
    }
    const navBlock = `\n      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>\n        ${navLinks.map(buildLink).join('\n        ')}\n      </nav>`;
    const insertAt = mainMatch.index + mainMatch[0].length;
    content = content.slice(0, insertAt) + navBlock + content.slice(insertAt);
  }

  if (content !== original) {
    write(file, content);
    console.log(`OK ${file}: Web Research Release Navigation ergänzt.`);
  }
}

function patchEnvExample() {
  const file = '.env.example';
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  const required = [
    'WEB_RESEARCH_ENABLED=false',
    'BING_SEARCH_API_KEY=',
    'BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search',
    'WEB_RESEARCH_GOVERNANCE_ENABLED=true',
    'WEB_RESEARCH_SAFE_MODE=true',
    'WEB_RESEARCH_SUMMARY_MODEL=',
  ];
  if (!content.includes('# Web Research Release Settings')) {
    content += '\n# Web Research Release Settings\n';
  }
  for (const line of required) {
    const key = line.split('=')[0];
    if (!content.includes(`${key}=`)) content += `${line}\n`;
  }
  if (content !== original) {
    write(file, content);
    console.log('OK .env.example: Web Research Release Settings finalisiert.');
  } else console.log('SKIP .env.example: bereits vollständig.');
}

function patchReadme() {
  const file = 'README.md';
  if (!exists(file)) return;
  let content = read(file);
  const original = content;
  if (!content.includes('## Phase 9 Web Research Release')) {
    content += `

## Phase 9 Web Research Release

Phase 9 ergänzt kontrollierte Web Research Fähigkeiten für den Privacy-First Agent.

Web Research ist standardmäßig deaktiviert und wird über Environment-Variablen aktiviert:

\`\`\`env
WEB_RESEARCH_ENABLED=true
BING_SEARCH_API_KEY=...
BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search
WEB_RESEARCH_GOVERNANCE_ENABLED=true
WEB_RESEARCH_SAFE_MODE=true
\`\`\`

Wichtige Routen:

- \`/web-research\` – Web Research testen
- \`/web-research-save\` – geprüfte Research-Ergebnisse speichern
- \`/web-research-governance\` – Governance Check
- \`/web-research-settings\` – Admin/Settings ohne Secret-Leak
- \`/analytics\` – Web Research Analytics

Release Checks:

\`\`\`powershell
npm run web:research:hardening:verify
npm run web:research:smoke
npm run stack:health
\`\`\`
`;
  }
  if (content !== original) {
    write(file, content);
    console.log('OK README.md: Phase 9 Release Abschnitt ergänzt.');
  } else console.log('SKIP README.md: Release Abschnitt bereits vorhanden.');
}

function patchPackage() {
  const file = 'package.json';
  const pkg = JSON.parse(read(file));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['web:research:release:verify'] = 'node scripts/phase9-9-verify-web-research-release.cjs';
  pkg.scripts['web:research:release:check'] = 'npm run web:research:release:verify && npm run web:research:hardening:verify && npm run web:research:smoke';
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log('OK package.json: web:research:release:* eingetragen.');
}

[
  'frontend/app/page.tsx',
  'frontend/app/web-research/page.tsx',
  'frontend/app/web-research-save/page.tsx',
  'frontend/app/web-research-governance/page.tsx',
  'frontend/app/web-research-settings/page.tsx',
  'frontend/app/analytics/page.tsx',
  'frontend/app/system/page.tsx',
].forEach(patchNavigation);

patchEnvExample();
patchReadme();
patchPackage();
console.log('Phase 9.9 Patch abgeschlossen.');
