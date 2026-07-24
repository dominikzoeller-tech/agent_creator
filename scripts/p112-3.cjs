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

write('README_PHASE112_3.md', `# Phase 112.3 - Gremium UI Handoff

Finaler Handoff fuer Phase 112.

Phase 112 hat aus dem internen Gremium-Agenten eine nutzbare UI-Kette gebaut: Eingabe, Run-Flow und Ergebnis-Panels.

## Gebaut

- Phase 112.0: Gremium Ask UI
  - Store: frontend/lib/cmt-ask.ts
  - API: /api/cmt/ask
  - UI: /cmt/ask

- Phase 112.1: Gremium Run
  - Store: frontend/lib/cmt-run.ts
  - API: /api/cmt/run
  - UI: /cmt/run

- Phase 112.2: Gremium View
  - Store: frontend/lib/cmt-view.ts
  - API: /api/cmt/view
  - UI: /cmt/view

## Wirkung

Der Agent kann jetzt intern und simuliert:

1. Eine Nutzerfrage in einer UI entgegennehmen.
2. Die Frage per Button an eine lokale API senden.
3. Das interne Gremium dry-run-only auswerten.
4. Antwort, Entscheidung, Rollen, Risiken und Aktionen in Panels anzeigen.

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- finalDispatchBlocked = true

## Naechster Schritt

Weiter mit Phase 113.0: Session-Verlauf fuer Gremiumsfragen.
`);

write('scripts/v112-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE112_3.md', 'Phase 112.3'],
  ['README_PHASE112_3.md', 'Gremium Ask UI'],
  ['README_PHASE112_3.md', 'Gremium Run'],
  ['README_PHASE112_3.md', 'Gremium View'],
  ['README_PHASE112_3.md', 'provider = none'],
  ['README_PHASE112_3.md', 'dryRunOnly = true'],
  ['README_PHASE112_3.md', 'networkCallAllowed = false'],
  ['README_PHASE112_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE112_3.md', 'Phase 113.0'],
  ['frontend/lib/cmt-ask.ts', 'createCommitteeAskState'],
  ['frontend/lib/cmt-run.ts', 'createCommitteeRun'],
  ['frontend/lib/cmt-view.ts', 'createCommitteeView'],
  ['package.json', 'phase112:3:verify'],
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
console.log('Phase 112.3 Handoff verification OK.');
`);

write('scripts/s112-3.cjs', `const http = require('http');

const urls = [
  ['Ask UI', 'http://localhost:3000/cmt/ask'],
  ['Run UI', 'http://localhost:3000/cmt/run'],
  ['View UI', 'http://localhost:3000/cmt/view'],
  ['Ask API', 'http://localhost:3000/api/cmt/ask'],
  ['Run API', 'http://localhost:3000/api/cmt/run'],
  ['View API', 'http://localhost:3000/api/cmt/view'],
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
pkg.scripts['phase112:3:verify'] = 'node scripts/v112-3.cjs';
pkg.scripts['phase112:3:smoke'] = 'node scripts/s112-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 112.3 Gremium UI Handoff patch applied.');
