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

write('README_PHASE113_3.md', `# Phase 113.3 - Gremium Session Handoff

Finaler Handoff fuer Phase 113.

Phase 113 hat den Session-Verlauf fuer den Gremium-Agenten gebaut.

## Gebaut

- Phase 113.0: Gremium History
  - Store: frontend/lib/cmt-hist.ts
  - API: /api/cmt/hist
  - UI: /cmt/hist

- Phase 113.1: Gremium Save
  - Store: frontend/lib/cmt-save.ts
  - API: /api/cmt/save
  - UI: /cmt/save

- Phase 113.2: Gremium Summary
  - Store: frontend/lib/cmt-sum.ts
  - API: /api/cmt/sum
  - UI: /cmt/sum

## Wirkung

Der Agent kann jetzt intern und simuliert:

1. Mehrere Gremiumsfragen als Verlauf darstellen.
2. Fragen als dry-run-only Session sammeln.
3. Eine gespeicherte Session zusammenfassen.
4. Entscheidungen, Risiken und Aktionen ueber mehrere Fragen aggregieren.

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- finalDispatchBlocked = true

## Naechster Schritt

Weiter mit Phase 114.0: MVP-Demo-Flow fuer den Gremium-Agenten.
`);

write('scripts/v113-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE113_3.md', 'Phase 113.3'],
  ['README_PHASE113_3.md', 'Gremium History'],
  ['README_PHASE113_3.md', 'Gremium Save'],
  ['README_PHASE113_3.md', 'Gremium Summary'],
  ['README_PHASE113_3.md', 'provider = none'],
  ['README_PHASE113_3.md', 'dryRunOnly = true'],
  ['README_PHASE113_3.md', 'networkCallAllowed = false'],
  ['README_PHASE113_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE113_3.md', 'Phase 114.0'],
  ['frontend/lib/cmt-hist.ts', 'createCommitteeHistory'],
  ['frontend/lib/cmt-save.ts', 'createCommitteeSavedSession'],
  ['frontend/lib/cmt-sum.ts', 'createCommitteeSessionSummary'],
  ['package.json', 'phase113:3:verify'],
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
console.log('Phase 113.3 Handoff verification OK.');
`);

write('scripts/s113-3.cjs', `const http = require('http');

const urls = [
  ['History UI', 'http://localhost:3000/cmt/hist'],
  ['Save UI', 'http://localhost:3000/cmt/save'],
  ['Summary UI', 'http://localhost:3000/cmt/sum'],
  ['History API', 'http://localhost:3000/api/cmt/hist'],
  ['Save API', 'http://localhost:3000/api/cmt/save'],
  ['Summary API', 'http://localhost:3000/api/cmt/sum'],
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
pkg.scripts['phase113:3:verify'] = 'node scripts/v113-3.cjs';
pkg.scripts['phase113:3:smoke'] = 'node scripts/s113-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 113.3 Gremium Session Handoff patch applied.');
