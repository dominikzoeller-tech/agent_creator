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

write('README_PHASE111_3.md', `# Phase 111.3 - User Frage Session Handoff

Finaler Handoff fuer Phase 111.

Phase 111 hat aus dem internen Gremium-Agenten eine erste nutzernahe Frage-Session mit Ergebnis und Kurzbrief gebaut.

## Gebaut

- Phase 111.0: User Frage Session
  - Store: frontend/lib/cmt-session.ts
  - API: /api/cmt/session
  - UI: /cmt/session

- Phase 111.1: Gremium Ergebnis
  - Store: frontend/lib/cmt-result.ts
  - API: /api/cmt/result
  - UI: /cmt/result

- Phase 111.2: Gremium Brief
  - Store: frontend/lib/cmt-brief.ts
  - API: /api/cmt/brief
  - UI: /cmt/brief

## Wirkung

Der Agent kann jetzt intern und simuliert:

1. Eine User-Frage als Session erfassen.
2. Die Frage an das interne Gremium uebergeben.
3. Ein Gremium-Ergebnis mit verdict, Begruendung, Risiken und Aktionen bilden.
4. Eine kurze Nutzerantwort als Brief erzeugen.

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- networkCallAllowed = false
- providerDispatchAllowed = false
- finalDispatchBlocked = true

## Naechster Schritt

Weiter mit Phase 112.0: echte Eingabe-UI fuer Nutzerfragen an das Gremium.
`);

write('scripts/v111-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE111_3.md', 'Phase 111.3'],
  ['README_PHASE111_3.md', 'User Frage Session'],
  ['README_PHASE111_3.md', 'Gremium Ergebnis'],
  ['README_PHASE111_3.md', 'Gremium Brief'],
  ['README_PHASE111_3.md', 'provider = none'],
  ['README_PHASE111_3.md', 'dryRunOnly = true'],
  ['README_PHASE111_3.md', 'networkCallAllowed = false'],
  ['README_PHASE111_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE111_3.md', 'Phase 112.0'],
  ['frontend/lib/cmt-session.ts', 'createCommitteeSession'],
  ['frontend/lib/cmt-result.ts', 'createCommitteeDecisionResult'],
  ['frontend/lib/cmt-brief.ts', 'createCommitteeBrief'],
  ['package.json', 'phase111:3:verify'],
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
console.log('Phase 111.3 Handoff verification OK.');
`);

write('scripts/s111-3.cjs', `const http = require('http');

const urls = [
  ['Session UI', 'http://localhost:3000/cmt/session'],
  ['Result UI', 'http://localhost:3000/cmt/result'],
  ['Brief UI', 'http://localhost:3000/cmt/brief'],
  ['Session API', 'http://localhost:3000/api/cmt/session'],
  ['Result API', 'http://localhost:3000/api/cmt/result'],
  ['Brief API', 'http://localhost:3000/api/cmt/brief'],
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
pkg.scripts['phase111:3:verify'] = 'node scripts/v111-3.cjs';
pkg.scripts['phase111:3:smoke'] = 'node scripts/s111-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 111.3 Handoff patch applied.');
