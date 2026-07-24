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

write('README_PHASE128_3.md', `# Phase 128.3 - Secure Master Structured Main View Handoff

Finaler Handoff fuer Phase 128.

Phase 128 hat die Secure-Master-Hauptansicht optisch klarer strukturiert und Status, Entry und Handoff fuer die neue Structured Main View ergaenzt.

## Gebaut

- Phase 128.0: Secure Master Structured Main View
  - Store: frontend/lib/cmt-master-main-view-model.ts
  - API: /api/cmt/master/secure/main/view
  - UI: /cmt/master/secure

- Phase 128.1: Secure Master Structured Main View Status
  - Store: frontend/lib/cmt-master-main-view-status.ts
  - API: /api/cmt/master/secure/main/view/status
  - UI: /cmt/master/secure/main/view/status

- Phase 128.2: Secure Master Structured Main View Entry
  - Store: frontend/lib/cmt-master-main-view-entry.ts
  - API: /api/cmt/master/secure/main/view/entry
  - UI: /cmt/master/secure/main/view/entry

## Wirkung

Die Hauptseite /cmt/master/secure zeigt jetzt lokal strukturierter:

1. Frageingabe.
2. Privacy-Option.
3. Status-Badges.
4. Kompakte Antwortbloecke.
5. 5er-Gremium-Karten bei Bedarf.
6. Kontrollseiten-Links.
7. Safety State ueber Badges und Bloecke.

## Sichtbare Badges

- Route
- Intent
- Privacy Gate
- Gremium
- Live Model
- External Sharing
- Network

## Wichtigste Testseiten

- /cmt/master/secure
- /cmt/master/secure/main/view/status
- /cmt/master/secure/main/view/entry
- /cmt/master/secure/main/status
- /cmt/master/secure/main/entry
- /cmt/master/secure/unified
- /cmt/master/secure/quality
- /cmt/master/secure/committee

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure

## Status

Der Secure Master Agent ist lokal testbar.

Die Hauptseite ist strukturierter und produktnaeher.

Status-Badges, kompakte Antwortbloecke und Gremiumskarten sind sichtbar.

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

Phase 129.0: Lokales Antwortprotokoll fuer Secure Master einfuehren.

Ziel:

- Jede lokale Anfrage als Protokoll-Objekt erfassen.
- Input, Intent, Route, Privacy-Entscheidung, Badges und Safety State speichern.
- Protokoll lokal anzeigen.
- Noch kein Provider.
- Kein Internet.
- Kein Live-Modell.
`);

write('scripts/v128-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE128_3.md', 'Phase 128.3'],
  ['README_PHASE128_3.md', 'Secure Master Structured Main View'],
  ['README_PHASE128_3.md', 'Secure Master Structured Main View Status'],
  ['README_PHASE128_3.md', 'Secure Master Structured Main View Entry'],
  ['README_PHASE128_3.md', '/cmt/master/secure'],
  ['README_PHASE128_3.md', 'http://localhost:3001/cmt/master/secure'],
  ['README_PHASE128_3.md', 'Status-Badges'],
  ['README_PHASE128_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE128_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE128_3.md', 'Phase 129.0'],
  ['frontend/lib/cmt-master-main-view-model.ts', 'askSecureMasterMainView'],
  ['frontend/lib/cmt-master-main-view-status.ts', 'getSecureMasterMainViewStatus'],
  ['frontend/lib/cmt-master-main-view-entry.ts', 'getSecureMasterMainViewEntry'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Structured Main View'],
  ['package.json', 'phase128:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 128.3 Secure Master Structured Main View Handoff verification OK.');
`);

write('scripts/s128-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Main UI', 'http://localhost:' + port + '/cmt/master/secure'],
  ['Structured Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/view/status'],
  ['Structured Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/view/entry'],
  ['Main View API', 'http://localhost:' + port + '/api/cmt/master/secure/main/view'],
  ['Structured Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/view/status'],
  ['Structured Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/view/entry'],
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
pkg.scripts['phase128:3:verify'] = 'node scripts/v128-3.cjs';
pkg.scripts['phase128:3:smoke'] = 'node scripts/s128-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 128.3 Secure Master Structured Main View Handoff patch applied.');
