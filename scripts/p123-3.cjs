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

write('README_PHASE123_3.md', `# Phase 123.3 - Secure Master Entry Handoff

Finaler Handoff fuer Phase 123.

Phase 123 hat den Secure Master Agent als zentralen lokalen Einstieg sichtbar gemacht.

## Gebaut

- Phase 123.0: Secure Master Home Entry
  - Store: frontend/lib/cmt-master-home.ts
  - API: /api/cmt/master/home
  - UI: /cmt/master/home

- Phase 123.1: Secure Master Navigation Status
  - Store: frontend/lib/cmt-master-nav-status.ts
  - API: /api/cmt/master/nav/status
  - UI: /cmt/master/nav/status

- Phase 123.2: Secure Master App Entry
  - Store: frontend/lib/cmt-master-app-entry.ts
  - API: /api/cmt/master/app-entry
  - UI: /cmt/master/app-entry

## Wichtigster lokaler Testpunkt

Aktuell wichtigste Seite:

- /cmt/master/secure

Empfohlenes Bookmark lokal:

- http://localhost:3001/cmt/master/secure

## Kontrollseiten

- /cmt/master/home
- /cmt/master/nav/status
- /cmt/master/app-entry
- /cmt/master/secure/status
- /cmt/master/secure/guide

## Aktueller Status

Der Secure Master Agent ist lokal testbar.

Er ist noch nicht live mit KI-Modell.

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

Phase 124.0: Lokale Antwortqualität im Secure Master verbessern.

Ziel:

- Antworten sollen weniger generisch sein.
- Secure Master soll bei unterschiedlichen Fragen klarer reagieren.
- Bei Gremiumsfragen sollen die 5 Rollen sichtbarer werden.
- Bei internen Daten soll die Datenschutzantwort klarer werden.
- Bei Tool-Fragen soll er sauber sagen, welches Tool fehlt.

Noch kein Provider in Phase 124.0.
`);

write('scripts/v123-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE123_3.md', 'Phase 123.3'],
  ['README_PHASE123_3.md', 'Secure Master Home Entry'],
  ['README_PHASE123_3.md', 'Secure Master Navigation Status'],
  ['README_PHASE123_3.md', 'Secure Master App Entry'],
  ['README_PHASE123_3.md', '/cmt/master/secure'],
  ['README_PHASE123_3.md', 'http://localhost:3001/cmt/master/secure'],
  ['README_PHASE123_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE123_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE123_3.md', 'Phase 124.0'],
  ['frontend/lib/cmt-master-home.ts', 'getSecureMasterHome'],
  ['frontend/lib/cmt-master-nav-status.ts', 'getSecureMasterNavStatus'],
  ['frontend/lib/cmt-master-app-entry.ts', 'getSecureMasterAppEntry'],
  ['package.json', 'phase123:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 123.3 Secure Master Entry Handoff verification OK.');
`);

write('scripts/s123-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Secure Master UI', 'http://localhost:' + port + '/cmt/master/secure'],
  ['Home Entry UI', 'http://localhost:' + port + '/cmt/master/home'],
  ['Nav Status UI', 'http://localhost:' + port + '/cmt/master/nav/status'],
  ['App Entry UI', 'http://localhost:' + port + '/cmt/master/app-entry'],
  ['Home API', 'http://localhost:' + port + '/api/cmt/master/home'],
  ['Nav Status API', 'http://localhost:' + port + '/api/cmt/master/nav/status'],
  ['App Entry API', 'http://localhost:' + port + '/api/cmt/master/app-entry'],
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
pkg.scripts['phase123:3:verify'] = 'node scripts/v123-3.cjs';
pkg.scripts['phase123:3:smoke'] = 'node scripts/s123-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 123.3 Secure Master Entry Handoff patch applied.');
