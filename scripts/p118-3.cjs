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

write('README_PHASE118_3.md', `# Phase 118.3 - Gremium Local JSON Handoff

Finaler Handoff fuer Phase 118.

Phase 118 hat Local JSON Persistenz fuer Gremiums-Sessions vorbereitet, weiterhin dry-run-only.

## Gebaut

- Phase 118.0: Gremium Local JSON Plan
  - Store: frontend/lib/cmt-json.ts
  - API: /api/cmt/json
  - UI: /cmt/json

- Phase 118.1: Gremium Local JSON Status
  - Store: frontend/lib/cmt-json-status.ts
  - API: /api/cmt/json/status
  - UI: /cmt/json/status

- Phase 118.2: Gremium Local JSON Guide
  - Store: frontend/lib/cmt-json-guide.ts
  - API: /api/cmt/json/guide
  - UI: /cmt/json/guide

## Wirkung

Der Agent hat jetzt intern und simuliert:

1. Einen Local JSON Persistenz-Plan.
2. Zielordner, Dateiname und Payload fuer Session-Dateien.
3. Eine Statusseite fuer Local JSON Checks.
4. Einen Guide fuer geplante Dateien und blockierte Safety-Felder.

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- externalStorageEnabled = false
- actualFileWriteEnabled = false
- finalDispatchBlocked = true

## Naechster Schritt

Weiter mit Phase 119.0: Local JSON Write-Preview bauen, weiterhin ohne echte Datei-Schreibvorgaenge.
`);

write('scripts/v118-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE118_3.md', 'Phase 118.3'],
  ['README_PHASE118_3.md', 'Gremium Local JSON Plan'],
  ['README_PHASE118_3.md', 'Gremium Local JSON Status'],
  ['README_PHASE118_3.md', 'Gremium Local JSON Guide'],
  ['README_PHASE118_3.md', 'provider = none'],
  ['README_PHASE118_3.md', 'dryRunOnly = true'],
  ['README_PHASE118_3.md', 'networkCallAllowed = false'],
  ['README_PHASE118_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE118_3.md', 'externalStorageEnabled = false'],
  ['README_PHASE118_3.md', 'actualFileWriteEnabled = false'],
  ['README_PHASE118_3.md', 'Phase 119.0'],
  ['frontend/lib/cmt-json.ts', 'getCommitteeLocalJsonPlan'],
  ['frontend/lib/cmt-json-status.ts', 'getCommitteeLocalJsonStatus'],
  ['frontend/lib/cmt-json-guide.ts', 'getCommitteeLocalJsonGuide'],
  ['package.json', 'phase118:3:verify'],
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
console.log('Phase 118.3 Handoff verification OK.');
`);

write('scripts/s118-3.cjs', `const http = require('http');

const urls = [
  ['JSON UI', 'http://localhost:3000/cmt/json'],
  ['Status UI', 'http://localhost:3000/cmt/json/status'],
  ['Guide UI', 'http://localhost:3000/cmt/json/guide'],
  ['JSON API', 'http://localhost:3000/api/cmt/json'],
  ['Status API', 'http://localhost:3000/api/cmt/json/status'],
  ['Guide API', 'http://localhost:3000/api/cmt/json/guide'],
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
pkg.scripts['phase118:3:verify'] = 'node scripts/v118-3.cjs';
pkg.scripts['phase118:3:smoke'] = 'node scripts/s118-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 118.3 Gremium Local JSON Handoff patch applied.');
