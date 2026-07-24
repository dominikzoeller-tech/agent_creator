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

write('README_PHASE117_3.md', `# Phase 117.3 - Gremium Persist Handoff

Finaler Handoff fuer Phase 117.

Phase 117 hat den Persistenz-Adapter fuer Gremiums-Sessions vorbereitet.

## Gebaut

- Phase 117.0: Gremium Persist Adapter
  - Store: frontend/lib/cmt-persist.ts
  - API: /api/cmt/persist
  - UI: /cmt/persist

- Phase 117.1: Gremium Persist Status
  - Store: frontend/lib/cmt-persist-status.ts
  - API: /api/cmt/persist/status
  - UI: /cmt/persist/status

- Phase 117.2: Gremium Persist Guide
  - Store: frontend/lib/cmt-persist-guide.ts
  - API: /api/cmt/persist/guide
  - UI: /cmt/persist/guide

## Wirkung

Der Agent hat jetzt intern und simuliert:

1. Einen dry-run-only Persistenz-Adapter fuer Gremiums-Sessions.
2. Einen vorbereiteten Persistenz-Key und Item-Count.
3. Eine Statusseite fuer Persistenz-Checks.
4. Einen Guide fuer naechste Adapter-Ziele.

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- externalStorageEnabled = false
- finalDispatchBlocked = true

## Naechster Schritt

Weiter mit Phase 118.0: Local JSON Persistenz vorbereiten, weiterhin dry-run-only.
`);

write('scripts/v117-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE117_3.md', 'Phase 117.3'],
  ['README_PHASE117_3.md', 'Gremium Persist Adapter'],
  ['README_PHASE117_3.md', 'Gremium Persist Status'],
  ['README_PHASE117_3.md', 'Gremium Persist Guide'],
  ['README_PHASE117_3.md', 'provider = none'],
  ['README_PHASE117_3.md', 'dryRunOnly = true'],
  ['README_PHASE117_3.md', 'networkCallAllowed = false'],
  ['README_PHASE117_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE117_3.md', 'externalStorageEnabled = false'],
  ['README_PHASE117_3.md', 'Phase 118.0'],
  ['frontend/lib/cmt-persist.ts', 'createCommitteePersistAdapter'],
  ['frontend/lib/cmt-persist-status.ts', 'getCommitteePersistStatus'],
  ['frontend/lib/cmt-persist-guide.ts', 'getCommitteePersistGuide'],
  ['package.json', 'phase117:3:verify'],
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
console.log('Phase 117.3 Handoff verification OK.');
`);

write('scripts/s117-3.cjs', `const http = require('http');

const urls = [
  ['Persist UI', 'http://localhost:3000/cmt/persist'],
  ['Status UI', 'http://localhost:3000/cmt/persist/status'],
  ['Guide UI', 'http://localhost:3000/cmt/persist/guide'],
  ['Persist API', 'http://localhost:3000/api/cmt/persist'],
  ['Status API', 'http://localhost:3000/api/cmt/persist/status'],
  ['Guide API', 'http://localhost:3000/api/cmt/persist/guide'],
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
pkg.scripts['phase117:3:verify'] = 'node scripts/v117-3.cjs';
pkg.scripts['phase117:3:smoke'] = 'node scripts/s117-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 117.3 Gremium Persist Handoff patch applied.');
