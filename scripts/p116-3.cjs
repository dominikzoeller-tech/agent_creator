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

write('README_PHASE116_3.md', `# Phase 116.3 - Gremium Navigation Handoff

Finaler Handoff fuer Phase 116.

Phase 116 hat die MVP-Navigation des Gremium-Agenten in die Haupt-App vorbereitet.

## Gebaut

- Phase 116.0: Gremium Main Navigation
  - Store: frontend/lib/cmt-nav.ts
  - API: /api/cmt/nav
  - UI: /cmt/nav

- Phase 116.1: Gremium Home Entry
  - Store: frontend/lib/cmt-home.ts
  - API: /api/cmt/home
  - UI: /cmt/home

- Phase 116.2: Gremium App Entry
  - Store: frontend/lib/cmt-app-entry.ts
  - API: /api/cmt/app-entry
  - UI: /cmt/app-entry

## Wirkung

Der Agent hat jetzt intern und simuliert:

1. Eine zentrale MVP-Navigation.
2. Einen Home-Einstieg fuer den Gremium-Agenten.
3. Einen App-Einstieg mit wichtigen MVP-Routen.
4. Verlinkung zu Landing, Demo, Report, Share, Guide und Status.

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- finalDispatchBlocked = true

## Naechster Schritt

Weiter mit Phase 117.0: Persistenz-Adapter fuer Gremiums-Sessions vorbereiten.
`);

write('scripts/v116-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE116_3.md', 'Phase 116.3'],
  ['README_PHASE116_3.md', 'Gremium Main Navigation'],
  ['README_PHASE116_3.md', 'Gremium Home Entry'],
  ['README_PHASE116_3.md', 'Gremium App Entry'],
  ['README_PHASE116_3.md', 'provider = none'],
  ['README_PHASE116_3.md', 'dryRunOnly = true'],
  ['README_PHASE116_3.md', 'networkCallAllowed = false'],
  ['README_PHASE116_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE116_3.md', 'Phase 117.0'],
  ['frontend/lib/cmt-nav.ts', 'getCommitteeMainNav'],
  ['frontend/lib/cmt-home.ts', 'getCommitteeHomeEntry'],
  ['frontend/lib/cmt-app-entry.ts', 'getCommitteeAppEntry'],
  ['package.json', 'phase116:3:verify'],
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
console.log('Phase 116.3 Handoff verification OK.');
`);

write('scripts/s116-3.cjs', `const http = require('http');

const urls = [
  ['Nav UI', 'http://localhost:3000/cmt/nav'],
  ['Home UI', 'http://localhost:3000/cmt/home'],
  ['App Entry UI', 'http://localhost:3000/cmt/app-entry'],
  ['Nav API', 'http://localhost:3000/api/cmt/nav'],
  ['Home API', 'http://localhost:3000/api/cmt/home'],
  ['App Entry API', 'http://localhost:3000/api/cmt/app-entry'],
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
pkg.scripts['phase116:3:verify'] = 'node scripts/v116-3.cjs';
pkg.scripts['phase116:3:smoke'] = 'node scripts/s116-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 116.3 Gremium Navigation Handoff patch applied.');
