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

write('README_PHASE115_3.md', `# Phase 115.3 - Gremium MVP Landing Handoff

Finaler Handoff fuer Phase 115.

Phase 115 hat die MVP-Demo-Landing fuer den Gremium-Agenten gebaut.

## Gebaut

- Phase 115.0: Gremium MVP Landing
  - Store: frontend/lib/cmt-land.ts
  - API: /api/cmt/land
  - UI: /cmt/land

- Phase 115.1: Gremium Landing Status
  - Store: frontend/lib/cmt-land-status.ts
  - API: /api/cmt/land/status
  - UI: /cmt/land/status

- Phase 115.2: Gremium Landing Guide
  - Store: frontend/lib/cmt-land-guide.ts
  - API: /api/cmt/land/guide
  - UI: /cmt/land/guide

## Wirkung

Der Agent hat jetzt intern und simuliert:

1. Eine zentrale Landing Page fuer den MVP-Demo-Flow.
2. Links zu Demo, Report, Share und Session Summary.
3. Eine Statusseite fuer Landing, Pages und API-Routen.
4. Einen kurzen Guide fuer den Demo-Ablauf.

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- finalDispatchBlocked = true

## Naechster Schritt

Weiter mit Phase 116.0: MVP-Navigation in die Haupt-App integrieren.
`);

write('scripts/v115-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE115_3.md', 'Phase 115.3'],
  ['README_PHASE115_3.md', 'Gremium MVP Landing'],
  ['README_PHASE115_3.md', 'Gremium Landing Status'],
  ['README_PHASE115_3.md', 'Gremium Landing Guide'],
  ['README_PHASE115_3.md', 'provider = none'],
  ['README_PHASE115_3.md', 'dryRunOnly = true'],
  ['README_PHASE115_3.md', 'networkCallAllowed = false'],
  ['README_PHASE115_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE115_3.md', 'Phase 116.0'],
  ['frontend/lib/cmt-land.ts', 'getCommitteeLanding'],
  ['frontend/lib/cmt-land-status.ts', 'getCommitteeLandingStatus'],
  ['frontend/lib/cmt-land-guide.ts', 'getCommitteeLandingGuide'],
  ['package.json', 'phase115:3:verify'],
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
console.log('Phase 115.3 Handoff verification OK.');
`);

write('scripts/s115-3.cjs', `const http = require('http');

const urls = [
  ['Landing UI', 'http://localhost:3000/cmt/land'],
  ['Status UI', 'http://localhost:3000/cmt/land/status'],
  ['Guide UI', 'http://localhost:3000/cmt/land/guide'],
  ['Landing API', 'http://localhost:3000/api/cmt/land'],
  ['Status API', 'http://localhost:3000/api/cmt/land/status'],
  ['Guide API', 'http://localhost:3000/api/cmt/land/guide'],
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
pkg.scripts['phase115:3:verify'] = 'node scripts/v115-3.cjs';
pkg.scripts['phase115:3:smoke'] = 'node scripts/s115-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 115.3 Gremium MVP Landing Handoff patch applied.');
