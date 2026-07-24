const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('WROTE', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n', 'utf8');

write('README_PHASE114_3.md', `# Phase 114.3 - Gremium MVP Demo Handoff

Finaler Handoff fuer Phase 114.

Phase 114 hat den ersten kompletten MVP-Demo-Flow fuer den Gremium-Agenten gebaut.

## Gebaut

- Phase 114.0: Gremium MVP Demo
  - Store: frontend/lib/cmt-demo.ts
  - API: /api/cmt/demo
  - UI: /cmt/demo

- Phase 114.1: Gremium Demo Report
  - Store: frontend/lib/cmt-demo-report.ts
  - API: /api/cmt/demo/report
  - UI: /cmt/demo/report

- Phase 114.2: Gremium Demo Share
  - Store: frontend/lib/cmt-demo-share.ts
  - API: /api/cmt/demo/share
  - UI: /cmt/demo/share

## Wirkung

Der Agent kann jetzt intern und simuliert:

1. Eine Nutzerfrage durch den kompletten MVP-Demo-Flow fuehren.
2. Intake, Routing, Deliberation, Ergebnis und Summary als Flow darstellen.
3. Einen kompakten Demo-Report erzeugen.
4. Eine copy-ready Demo-Zusammenfassung erstellen.

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- finalDispatchBlocked = true

## Naechster Schritt

Weiter mit Phase 115.0: MVP-Demo Landing Page fuer den Gremium-Agenten.
`);

write('scripts/v114-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE114_3.md', 'Phase 114.3'],
  ['README_PHASE114_3.md', 'Gremium MVP Demo'],
  ['README_PHASE114_3.md', 'Gremium Demo Report'],
  ['README_PHASE114_3.md', 'Gremium Demo Share'],
  ['README_PHASE114_3.md', 'provider = none'],
  ['README_PHASE114_3.md', 'dryRunOnly = true'],
  ['README_PHASE114_3.md', 'networkCallAllowed = false'],
  ['README_PHASE114_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE114_3.md', 'Phase 115.0'],
  ['frontend/lib/cmt-demo.ts', 'createCommitteeMvpDemo'],
  ['frontend/lib/cmt-demo-report.ts', 'createCommitteeDemoReport'],
  ['frontend/lib/cmt-demo-share.ts', 'createCommitteeDemoShare'],
  ['package.json', 'phase114:3:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    console.error('MISS', file);
    ok = false;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) {
    console.error('MISS fragment', fragment, 'in', file);
    ok = false;
  } else {
    console.log('OK', file, fragment);
  }
}

if (!ok) process.exit(1);
console.log('Phase 114.3 Handoff verification OK.');
`);

write('scripts/s114-3.cjs', `const http = require('http');

const urls = [
  ['Demo UI', 'http://localhost:3000/cmt/demo'],
  ['Report UI', 'http://localhost:3000/cmt/demo/report'],
  ['Share UI', 'http://localhost:3000/cmt/demo/share'],
  ['Demo API', 'http://localhost:3000/api/cmt/demo'],
  ['Report API', 'http://localhost:3000/api/cmt/demo/report'],
  ['Share API', 'http://localhost:3000/api/cmt/demo/share'],
];

function check(label, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);
      resolve(ok);
    });
    req.on('error', () => {
      console.log('FAIL ' + label + ': ' + url);
      resolve(false);
    });
    req.setTimeout(8000, () => {
      req.destroy();
      console.log('FAIL ' + label + ': timeout ' + url);
      resolve(false);
    });
  });
}

(async () => {
  const results = [];
  for (const [label, url] of urls) results.push(await check(label, url));
  if (!results.every(Boolean)) process.exit(1);
})();
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase114:3:verify'] = 'node scripts/v114-3.cjs';
pkg.scripts['phase114:3:smoke'] = 'node scripts/s114-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 114.3 Gremium MVP Demo Handoff patch applied.');
