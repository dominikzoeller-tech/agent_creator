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

write('README_PHASE134_3.md', `# Phase 134.3 - Secure Master Main Log List Select Handoff

Finaler Handoff fuer Phase 134.

Phase 134 hat die Select-Filterbedienung direkt in die Haupt-Loglistenansicht integriert und dazu Status, Entry und Handoff ergaenzt.

## Gebaut

- Phase 134.0: Secure Master Main Log List Select Integration
  - Store: frontend/lib/cmt-master-answer-log-list-main-select.ts
  - API: /api/cmt/master/secure/main/log/list/select
  - UI: /cmt/master/secure/main/log/list

- Phase 134.1: Secure Master Main Log List Select Status
  - Store: frontend/lib/cmt-master-answer-log-list-main-select-status.ts
  - API: /api/cmt/master/secure/main/log/list/select/status
  - UI: /cmt/master/secure/main/log/list/select/status

- Phase 134.2: Secure Master Main Log List Select Entry
  - Store: frontend/lib/cmt-master-answer-log-list-main-select-entry.ts
  - API: /api/cmt/master/secure/main/log/list/select/entry
  - UI: /cmt/master/secure/main/log/list/select/entry

## Wirkung

Die Haupt-Loglistenansicht ist jetzt der bevorzugte lokale Testpunkt fuer mehrere Secure-Master-Anfragen.

Sichtbar sind:

1. lokale Log-Eingaben.
2. Suche ueber inputPreview.
3. Route-Select.
4. Intent-Select.
5. Privacy-Select.
6. lokal abgeleitete Dropdown-Optionen.
7. sourceCount.
8. filteredCount.
9. gefilterte Items.
10. Safety State.
11. Persistence State.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/select/status
- /cmt/master/secure/main/log/list/select/entry
- /cmt/master/secure/main/log/list/filter/select
- /cmt/master/secure/main/log/list/filter/options
- /cmt/master/secure/main/log/list/filter
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list

## Testchecks

- Haupt-Logliste erreichbar.
- Route-Select direkt in Haupt-Logliste sichtbar.
- Intent-Select direkt in Haupt-Logliste sichtbar.
- Privacy-Select direkt in Haupt-Logliste sichtbar.
- Suche ueber inputPreview sichtbar.
- sourceCount sichtbar.
- filteredCount sichtbar.
- controlPagesPreserved = true.
- persistedInBrowser = false.
- persistedOnServer = false.
- externalSharingAllowed = false.

## Status

Der Secure Master Agent ist lokal testbar.

Die Haupt-Logliste nutzt jetzt die Select-Filterbedienung.

Die Kontrollseiten bleiben erhalten.

Noch keine dauerhafte Speicherung.

## Persistence State

- persistedInBrowser = false
- persistedOnServer = false
- localOnly = true

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

Phase 135.0: Browserseitige lokale Speicherung fuer die Haupt-Logliste vorbereiten.

Ziel:

- Logs optional in localStorage speichern.
- persistedInBrowser auf vorbereitet setzen.
- Server-Persistenz weiterhin false lassen.
- Loeschen/Reset vorbereiten.
- Export spaeter vorbereiten.
- weiterhin kein Provider.
- weiterhin kein Internet.
- weiterhin kein Live-Modell.
`);

write('scripts/v134-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE134_3.md', 'Phase 134.3'],
  ['README_PHASE134_3.md', 'Secure Master Main Log List Select Integration'],
  ['README_PHASE134_3.md', 'Secure Master Main Log List Select Status'],
  ['README_PHASE134_3.md', 'Secure Master Main Log List Select Entry'],
  ['README_PHASE134_3.md', '/cmt/master/secure/main/log/list'],
  ['README_PHASE134_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list'],
  ['README_PHASE134_3.md', 'Route-Select direkt in Haupt-Logliste sichtbar'],
  ['README_PHASE134_3.md', 'Intent-Select direkt in Haupt-Logliste sichtbar'],
  ['README_PHASE134_3.md', 'Privacy-Select direkt in Haupt-Logliste sichtbar'],
  ['README_PHASE134_3.md', 'persistedInBrowser = false'],
  ['README_PHASE134_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE134_3.md', 'Phase 135.0'],
  ['frontend/lib/cmt-master-answer-log-list-main-select.ts', 'createSecureMasterAnswerLogListMainSelect'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-status.ts', 'getSecureMasterAnswerLogListMainSelectStatus'],
  ['frontend/lib/cmt-master-answer-log-list-main-select-entry.ts', 'getSecureMasterAnswerLogListMainSelectEntry'],
  ['package.json', 'phase134:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 134.3 Secure Master Main Log List Select Handoff verification OK.');
`);

write('scripts/s134-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Main Log List UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list'],
  ['Main Select Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/select/status'],
  ['Main Select Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/select/entry'],
  ['Main Select API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/select'],
  ['Main Select Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/select/status'],
  ['Main Select Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/select/entry'],
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
pkg.scripts['phase134:3:verify'] = 'node scripts/v134-3.cjs';
pkg.scripts['phase134:3:smoke'] = 'node scripts/s134-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 134.3 Secure Master Main Log List Select Handoff patch applied.');
