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

write('README_PHASE127_3.md', `# Phase 127.3 - Secure Master Main View Handoff

Finaler Handoff fuer Phase 127.

Phase 127 hat den Unified Flow als echte Hauptansicht in /cmt/master/secure eingebaut und die Kontrollseiten fuer Status und Entry ergaenzt.

## Gebaut

- Phase 127.0: Secure Master Main Unified View
  - UI: /cmt/master/secure
  - nutzt API: /api/cmt/master/secure/unified
  - nutzt Store: frontend/lib/cmt-master-unified.ts

- Phase 127.1: Secure Master Main View Status
  - Store: frontend/lib/cmt-master-main-status.ts
  - API: /api/cmt/master/secure/main/status
  - UI: /cmt/master/secure/main/status

- Phase 127.2: Secure Master Main View Entry
  - Store: frontend/lib/cmt-master-main-entry.ts
  - API: /api/cmt/master/secure/main/entry
  - UI: /cmt/master/secure/main/entry

## Wirkung

Die Hauptseite /cmt/master/secure zeigt jetzt lokal direkt:

1. Lokale Antwort.
2. Routing.
3. Privacy Gate bei Bedarf.
4. 5er-Gremium bei Bedarf.
5. Safety State.
6. Links zu Kontrollseiten.

## Wichtigste Testseiten

- /cmt/master/secure
- /cmt/master/secure/main/status
- /cmt/master/secure/main/entry
- /cmt/master/secure/unified
- /cmt/master/secure/quality
- /cmt/master/secure/committee

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure

## Status

Der Secure Master Agent ist lokal testbar.

Die Hauptseite nutzt den Unified Flow.

Privacy Gate, Quality-Antwort und 5er-Gremium sind direkt auf der Hauptseite sichtbar testbar.

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

Phase 128.0: Hauptansicht optisch klarer strukturieren.

Ziel:

- Antwortbloecke kompakter anzeigen.
- Status-Badges fuer Safety, Routing und Privacy ergaenzen.
- Gremiumsausgabe lesbarer machen.
- Hauptseite mehr wie ein lokales Produkt wirken lassen.

Noch kein Provider in Phase 128.0.
`);

write('scripts/v127-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE127_3.md', 'Phase 127.3'],
  ['README_PHASE127_3.md', 'Secure Master Main Unified View'],
  ['README_PHASE127_3.md', 'Secure Master Main View Status'],
  ['README_PHASE127_3.md', 'Secure Master Main View Entry'],
  ['README_PHASE127_3.md', '/cmt/master/secure'],
  ['README_PHASE127_3.md', 'http://localhost:3001/cmt/master/secure'],
  ['README_PHASE127_3.md', 'Hauptseite nutzt den Unified Flow'],
  ['README_PHASE127_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE127_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE127_3.md', 'Phase 128.0'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Unified Main View'],
  ['frontend/lib/cmt-master-main-status.ts', 'getSecureMasterMainStatus'],
  ['frontend/lib/cmt-master-main-entry.ts', 'getSecureMasterMainEntry'],
  ['package.json', 'phase127:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 127.3 Secure Master Main View Handoff verification OK.');
`);

write('scripts/s127-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Main UI', 'http://localhost:' + port + '/cmt/master/secure'],
  ['Main Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/status'],
  ['Main Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/entry'],
  ['Unified UI', 'http://localhost:' + port + '/cmt/master/secure/unified'],
  ['Main Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/status'],
  ['Main Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/entry'],
  ['Unified API', 'http://localhost:' + port + '/api/cmt/master/secure/unified'],
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
pkg.scripts['phase127:3:verify'] = 'node scripts/v127-3.cjs';
pkg.scripts['phase127:3:smoke'] = 'node scripts/s127-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 127.3 Secure Master Main View Handoff patch applied.');
