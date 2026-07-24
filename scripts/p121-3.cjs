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

write('README_PHASE121_3.md', `# Phase 121.3 - Privacy Gate Handoff

Finaler Handoff fuer Phase 121.

Phase 121 hat das Datenschutz-Gate fuer den Master-Agenten vorbereitet.

## Gebaut

- Phase 121.0: Privacy Gate MVP
  - Store: frontend/lib/cmt-privacy-gate.ts
  - API: /api/cmt/privacy
  - UI: /cmt/privacy

- Phase 121.1: Privacy Gate Status
  - Store: frontend/lib/cmt-privacy-status.ts
  - API: /api/cmt/privacy/status
  - UI: /cmt/privacy/status

- Phase 121.2: Privacy Gate Decision Flow
  - Store: frontend/lib/cmt-privacy-decision.ts
  - API: /api/cmt/privacy/decision
  - UI: /cmt/privacy/decision

## Wirkung

Der Master-Agent kann jetzt lokal pruefen:

1. Ob eine Eingabe interne Signale enthaelt.
2. Ob eine Eingabe personenbezogene Signale enthaelt.
3. Ob eine Eingabe geschaeftliche Signale enthaelt.
4. Ob eine Eingabe geheime oder vertrauliche Signale enthaelt.
5. Ob nur lokale Verarbeitung, Anonymisierung, Freigabe oder Abbruch sinnvoll ist.

## Wichtig

Externe Weitergabe bleibt weiterhin blockiert.

Auch wenn die Option approve_external_send in der UI auftaucht, wird sie in Phase 121.2/121.3 nicht freigeschaltet.

## Testseiten

- /cmt/privacy
- /cmt/privacy/status
- /cmt/privacy/decision
- /cmt/master

## Safety State

- provider = none
- modelSelected = none
- dryRunOnly = true
- liveModelEnabled = false
- internetAccessEnabled = false
- networkCallAllowed = false
- providerDispatchAllowed = false
- externalSharingAllowed = false
- finalDispatchBlocked = true

## Status

Der Agent ist lokal testbar mit:

- Master Agent Router
- Gremium Ask MVP Plus
- Privacy Gate MVP
- Privacy Gate Decision Flow

Der Agent ist noch nicht live mit KI-Modell.

## Nächster sinnvoller Schritt

Phase 122.0: Master-Agent + Privacy-Gate zusammenführen.

Ziel: Eine zentrale Master-Agent-Seite, die bei jeder Frage automatisch Datenschutz prueft, danach lokal entscheidet:

- direkt antworten
- Gremium fragen
- Datenschutz-Freigabe verlangen
- Toolbedarf melden
- Spezialagent vorschlagen

Noch kein Live-Provider in Phase 122.0.
`);

write('scripts/v121-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE121_3.md', 'Phase 121.3'],
  ['README_PHASE121_3.md', 'Privacy Gate MVP'],
  ['README_PHASE121_3.md', 'Privacy Gate Status'],
  ['README_PHASE121_3.md', 'Privacy Gate Decision Flow'],
  ['README_PHASE121_3.md', '/cmt/privacy'],
  ['README_PHASE121_3.md', '/cmt/privacy/status'],
  ['README_PHASE121_3.md', '/cmt/privacy/decision'],
  ['README_PHASE121_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE121_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE121_3.md', 'Phase 122.0'],
  ['frontend/lib/cmt-privacy-gate.ts', 'evaluatePrivacyGate'],
  ['frontend/lib/cmt-privacy-status.ts', 'getPrivacyGateStatus'],
  ['frontend/lib/cmt-privacy-decision.ts', 'decidePrivacyAction'],
  ['package.json', 'phase121:3:verify'],
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
console.log('Phase 121.3 Privacy Gate Handoff verification OK.');
`);

write('scripts/s121-3.cjs', `const http = require('http');

const port = process.env.PORT || '3000';
const urls = [
  ['Privacy UI', 'http://localhost:' + port + '/cmt/privacy'],
  ['Privacy Status UI', 'http://localhost:' + port + '/cmt/privacy/status'],
  ['Privacy Decision UI', 'http://localhost:' + port + '/cmt/privacy/decision'],
  ['Privacy API', 'http://localhost:' + port + '/api/cmt/privacy'],
  ['Privacy Status API', 'http://localhost:' + port + '/api/cmt/privacy/status'],
  ['Privacy Decision API', 'http://localhost:' + port + '/api/cmt/privacy/decision'],
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
pkg.scripts['phase121:3:verify'] = 'node scripts/v121-3.cjs';
pkg.scripts['phase121:3:smoke'] = 'node scripts/s121-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 121.3 Privacy Gate Handoff patch applied.');
