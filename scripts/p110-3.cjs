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

write('README_PHASE110_3.md', `# Phase 110.3 - Gremium Core Handoff

Finaler Handoff fuer Phase 110.

Phase 110 hat den ersten echten MVP-Baustein fuer den Gremium-Agenten gebaut.

## Gebaut

- Phase 110.0: Gremium Core
  - Store: frontend/lib/cmt-store.ts
  - API: /api/cmt
  - UI: /cmt

- Phase 110.1: Question Intake und Routing
  - Store: frontend/lib/cmt-intake.ts
  - API: /api/cmt/intake
  - UI: /cmt/intake

- Phase 110.2: Gremium Deliberation
  - Store: frontend/lib/cmt-delib.ts
  - API: /api/cmt/delib
  - UI: /cmt/delib

## Wirkung

Der Agent kann jetzt intern und simuliert:

1. Gremiumsrollen kennen.
2. Eine Frage aufnehmen.
3. Thema und Risiko ableiten.
4. passende Gremiumsrollen auswaehlen.
5. Rollenmeinungen erzeugen.
6. Risiken und naechste Schritte aggregieren.
7. eine erste Empfehlung bilden.

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- finalDispatchBlocked = true

## Naechster Schritt

Weiter mit Phase 111.0: echte User-Frage-Session fuer den Gremium-Agenten.
`);

write('scripts/v110-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE110_3.md', 'Phase 110.3'],
  ['README_PHASE110_3.md', 'Gremium Core'],
  ['README_PHASE110_3.md', 'Question Intake'],
  ['README_PHASE110_3.md', 'Gremium Deliberation'],
  ['README_PHASE110_3.md', 'provider = none'],
  ['README_PHASE110_3.md', 'dryRunOnly = true'],
  ['README_PHASE110_3.md', 'networkCallAllowed = false'],
  ['README_PHASE110_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE110_3.md', 'Phase 111.0'],
  ['frontend/lib/cmt-store.ts', 'getCommitteeCore'],
  ['frontend/lib/cmt-intake.ts', 'createCommitteeQuestion'],
  ['frontend/lib/cmt-delib.ts', 'createCommitteeDeliberation'],
  ['package.json', 'phase110:3:verify'],
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
console.log('Phase 110.3 Handoff verification OK.');
`);

write('scripts/s110-3.cjs', `const http = require('http');

const urls = [
  ['Core UI', 'http://localhost:3000/cmt'],
  ['Intake UI', 'http://localhost:3000/cmt/intake'],
  ['Delib UI', 'http://localhost:3000/cmt/delib'],
  ['Core API', 'http://localhost:3000/api/cmt'],
  ['Intake API', 'http://localhost:3000/api/cmt/intake'],
  ['Delib API', 'http://localhost:3000/api/cmt/delib'],
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
pkg.scripts['phase110:3:verify'] = 'node scripts/v110-3.cjs';
pkg.scripts['phase110:3:smoke'] = 'node scripts/s110-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 110.3 Handoff patch applied.');
