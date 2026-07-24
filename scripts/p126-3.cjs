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

write('README_PHASE126_3.md', `# Phase 126.3 - Secure Master Unified Handoff

Finaler Handoff fuer Phase 126.

Phase 126 hat Privacy Gate, lokale Antwortqualitaet und 5er-Gremium in einen zentralen lokalen Unified Flow zusammengefuehrt.

## Gebaut

- Phase 126.0: Secure Master Unified Main Flow
  - Store: frontend/lib/cmt-master-unified.ts
  - API: /api/cmt/master/secure/unified
  - UI: /cmt/master/secure/unified

- Phase 126.1: Secure Master Unified Status
  - Store: frontend/lib/cmt-master-unified-status.ts
  - API: /api/cmt/master/secure/unified/status
  - UI: /cmt/master/secure/unified/status

- Phase 126.2: Secure Master Unified Entry
  - Store: frontend/lib/cmt-master-unified-entry.ts
  - API: /api/cmt/master/secure/unified/entry
  - UI: /cmt/master/secure/unified/entry

## Wirkung

Der Secure Master kann jetzt lokal in einem Flow anzeigen:

1. Lokale Antwort.
2. Routing-Entscheidung.
3. Privacy Gate bei Bedarf.
4. 5er-Gremium bei Bedarf.
5. Safety State.

## Wichtigste Testseiten

- /cmt/master/secure/unified
- /cmt/master/secure/unified/status
- /cmt/master/secure/unified/entry
- /cmt/master/secure
- /cmt/master/secure/quality
- /cmt/master/secure/committee

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/unified

## Status

Der Secure Master Agent ist lokal testbar.

Der Unified Flow ist sichtbar.

Privacy Gate, Quality-Antwort und 5er-Gremium sind zusammen testbar.

Der Agent ist noch nicht live mit KI-Modell.

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

## Was jetzt als Nächstes sinnvoll ist

Phase 127.0: Unified Flow als echte Hauptansicht in /cmt/master/secure einbauen.

Ziel:

- /cmt/master/secure soll direkt den Unified Flow verwenden.
- Nutzer soll nicht mehr /unified extra oeffnen muessen.
- Alte Seiten bleiben als Kontrollseiten erhalten.
- Keine Provider-Schaltung.
- Kein Internet.
- Kein Live-Modell.
`);

write('scripts/v126-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE126_3.md', 'Phase 126.3'],
  ['README_PHASE126_3.md', 'Secure Master Unified Main Flow'],
  ['README_PHASE126_3.md', 'Secure Master Unified Status'],
  ['README_PHASE126_3.md', 'Secure Master Unified Entry'],
  ['README_PHASE126_3.md', '/cmt/master/secure/unified'],
  ['README_PHASE126_3.md', 'http://localhost:3001/cmt/master/secure/unified'],
  ['README_PHASE126_3.md', 'Privacy Gate, Quality-Antwort und 5er-Gremium'],
  ['README_PHASE126_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE126_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE126_3.md', 'Phase 127.0'],
  ['frontend/lib/cmt-master-unified.ts', 'askSecureMasterUnified'],
  ['frontend/lib/cmt-master-unified-status.ts', 'getSecureMasterUnifiedStatus'],
  ['frontend/lib/cmt-master-unified-entry.ts', 'getSecureMasterUnifiedEntry'],
  ['package.json', 'phase126:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 126.3 Secure Master Unified Handoff verification OK.');
`);

write('scripts/s126-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Unified UI', 'http://localhost:' + port + '/cmt/master/secure/unified'],
  ['Unified Status UI', 'http://localhost:' + port + '/cmt/master/secure/unified/status'],
  ['Unified Entry UI', 'http://localhost:' + port + '/cmt/master/secure/unified/entry'],
  ['Unified API', 'http://localhost:' + port + '/api/cmt/master/secure/unified'],
  ['Unified Status API', 'http://localhost:' + port + '/api/cmt/master/secure/unified/status'],
  ['Unified Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/unified/entry'],
];
function check(label, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);
      resolve(ok);
    });
    req.on('error', () => { console.log('FAIL ' + label + ': ' + url); resolve(false); });
    req.setTimeout(8000, () => { req.destroy(); console.log('FAIL ' + label + ': timeout ' + url); resolve(false); });
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
pkg.scripts['phase126:3:verify'] = 'node scripts/v126-3.cjs';
pkg.scripts['phase126:3:smoke'] = 'node scripts/s126-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 126.3 Secure Master Unified Handoff patch applied.');
