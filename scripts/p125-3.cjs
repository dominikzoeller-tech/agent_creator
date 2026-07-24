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

write('README_PHASE125_3.md', `# Phase 125.3 - Secure Master Committee Handoff

Finaler Handoff fuer Phase 125.

Phase 125 hat das 5er-Gremium direkt in den Secure Master integriert und sichtbar testbar gemacht.

## Gebaut

- Phase 125.0: Secure Master Committee Integration
  - Store: frontend/lib/cmt-master-committee.ts
  - API: /api/cmt/master/secure/committee
  - UI: /cmt/master/secure/committee

- Phase 125.1: Secure Master Committee Status
  - Store: frontend/lib/cmt-master-committee-status.ts
  - API: /api/cmt/master/secure/committee/status
  - UI: /cmt/master/secure/committee/status

- Phase 125.2: Secure Master Committee Entry
  - Store: frontend/lib/cmt-master-committee-entry.ts
  - API: /api/cmt/master/secure/committee/entry
  - UI: /cmt/master/secure/committee/entry

## Wirkung

Der Secure Master kann jetzt lokal:

1. Entscheidungsfragen erkennen.
2. Das 5er-Gremium direkt ausgeben.
3. Die Rollen sichtbar machen.
4. Pro Rolle eine kurze Einschaetzung anzeigen.
5. Eine Zusammenfassung erzeugen.
6. Eine finale Empfehlung anzeigen.

## Rollen

- Visionär
- Skeptiker
- Umsetzer
- Datenschutz & Risiko
- Wirtschaftlichkeit & Praxisnutzen

## Wichtigste Testseiten

- /cmt/master/secure/committee
- /cmt/master/secure/committee/status
- /cmt/master/secure/committee/entry
- /cmt/master/secure/quality
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/committee

## Status

Der Secure Master Agent ist lokal testbar.

Das 5er-Gremium ist sichtbar integriert.

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

Phase 126.0: Gremiumsausgabe in die Hauptseite /cmt/master/secure integrieren.

Ziel:

- Nutzer soll nicht zwischen /quality und /committee wechseln muessen.
- Die Hauptseite /cmt/master/secure soll direkt die bessere Antwort und bei Bedarf das 5er-Gremium anzeigen.
- Privacy Gate, Quality Detection und Committee Output sollen in einem zentralen lokalen Flow sichtbar werden.

Noch kein Provider in Phase 126.0.
`);

write('scripts/v125-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE125_3.md', 'Phase 125.3'],
  ['README_PHASE125_3.md', 'Secure Master Committee Integration'],
  ['README_PHASE125_3.md', 'Secure Master Committee Status'],
  ['README_PHASE125_3.md', 'Secure Master Committee Entry'],
  ['README_PHASE125_3.md', '/cmt/master/secure/committee'],
  ['README_PHASE125_3.md', 'http://localhost:3001/cmt/master/secure/committee'],
  ['README_PHASE125_3.md', '5er-Gremium ist sichtbar integriert'],
  ['README_PHASE125_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE125_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE125_3.md', 'Phase 126.0'],
  ['frontend/lib/cmt-master-committee.ts', 'askSecureMasterCommittee'],
  ['frontend/lib/cmt-master-committee-status.ts', 'getSecureMasterCommitteeStatus'],
  ['frontend/lib/cmt-master-committee-entry.ts', 'getSecureMasterCommitteeEntry'],
  ['package.json', 'phase125:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 125.3 Secure Master Committee Handoff verification OK.');
`);

write('scripts/s125-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Committee UI', 'http://localhost:' + port + '/cmt/master/secure/committee'],
  ['Committee Status UI', 'http://localhost:' + port + '/cmt/master/secure/committee/status'],
  ['Committee Entry UI', 'http://localhost:' + port + '/cmt/master/secure/committee/entry'],
  ['Committee API', 'http://localhost:' + port + '/api/cmt/master/secure/committee'],
  ['Committee Status API', 'http://localhost:' + port + '/api/cmt/master/secure/committee/status'],
  ['Committee Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/committee/entry'],
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
pkg.scripts['phase125:3:verify'] = 'node scripts/v125-3.cjs';
pkg.scripts['phase125:3:smoke'] = 'node scripts/s125-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 125.3 Secure Master Committee Handoff patch applied.');
