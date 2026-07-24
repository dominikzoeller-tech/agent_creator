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

write('README_PHASE133_3.md', `# Phase 133.3 - Secure Master Local Answer Log List Filter Select Handoff

Finaler Handoff fuer Phase 133.

Phase 133 hat die lokal abgeleiteten Filter-Optionen aus Phase 132 in eine echte Select-Filteransicht integriert und dazu Status, Entry und Handoff ergaenzt.

## Gebaut

- Phase 133.0: Secure Master Local Answer Log List Filter Select
  - Store: frontend/lib/cmt-master-answer-log-list-filter-select.ts
  - API: /api/cmt/master/secure/main/log/list/filter/select
  - UI: /cmt/master/secure/main/log/list/filter/select

- Phase 133.1: Secure Master Local Answer Log List Filter Select Status
  - Store: frontend/lib/cmt-master-answer-log-list-filter-select-status.ts
  - API: /api/cmt/master/secure/main/log/list/filter/select/status
  - UI: /cmt/master/secure/main/log/list/filter/select/status

- Phase 133.2: Secure Master Local Answer Log List Filter Select Entry
  - Store: frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts
  - API: /api/cmt/master/secure/main/log/list/filter/select/entry
  - UI: /cmt/master/secure/main/log/list/filter/select/entry

## Wirkung

Der Secure Master hat jetzt eine lokale Select-Filteransicht fuer die In-Memory-Answer-Logliste.

Sichtbar sind:

1. Suche ueber inputPreview.
2. Route-Select.
3. Intent-Select.
4. Privacy-Select.
5. lokal abgeleitete Dropdown-Optionen.
6. sourceCount.
7. filteredCount.
8. gefilterte Items.
9. Safety State.
10. Persistence State.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list/filter/select
- /cmt/master/secure/main/log/list/filter/select/status
- /cmt/master/secure/main/log/list/filter/select/entry
- /cmt/master/secure/main/log/list/filter/options
- /cmt/master/secure/main/log/list/filter
- /cmt/master/secure/main/log/list
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list/filter/select

## Testchecks

- Route-Select sichtbar.
- Intent-Select sichtbar.
- Privacy-Select sichtbar.
- Suche sichtbar.
- Options-Ableitung aus Phase 132 aktiv.
- sourceCount sichtbar.
- filteredCount sichtbar.
- persistedInBrowser = false.
- persistedOnServer = false.
- externalSharingAllowed = false.

## Status

Der Secure Master Agent ist lokal testbar.

Die Select-Filteransicht ist sichtbar.

Die Dropdown-Optionen werden lokal abgeleitet.

Route-Filter, Intent-Filter und Privacy-Filter sind als Select vorbereitet.

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

Phase 134.0: Select-Filter direkt in die Haupt-Loglistenansicht integrieren.

Ziel:

- /cmt/master/secure/main/log/list bekommt die bessere Select-Filterbedienung.
- bestehende Filter-/Optionsseiten bleiben als Kontrollseiten erhalten.
- Logliste wird nutzerfreundlicher.
- weiterhin keine Persistenz.
- weiterhin kein Provider.
- weiterhin kein Internet.
- weiterhin kein Live-Modell.
`);

write('scripts/v133-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE133_3.md', 'Phase 133.3'],
  ['README_PHASE133_3.md', 'Secure Master Local Answer Log List Filter Select'],
  ['README_PHASE133_3.md', 'Secure Master Local Answer Log List Filter Select Status'],
  ['README_PHASE133_3.md', 'Secure Master Local Answer Log List Filter Select Entry'],
  ['README_PHASE133_3.md', '/cmt/master/secure/main/log/list/filter/select'],
  ['README_PHASE133_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/filter/select'],
  ['README_PHASE133_3.md', 'Route-Select sichtbar'],
  ['README_PHASE133_3.md', 'Intent-Select sichtbar'],
  ['README_PHASE133_3.md', 'Privacy-Select sichtbar'],
  ['README_PHASE133_3.md', 'persistedInBrowser = false'],
  ['README_PHASE133_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE133_3.md', 'Phase 134.0'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select.ts', 'createSecureMasterAnswerLogListFilterSelect'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-status.ts', 'getSecureMasterAnswerLogListFilterSelectStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-select-entry.ts', 'getSecureMasterAnswerLogListFilterSelectEntry'],
  ['package.json', 'phase133:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 133.3 Secure Master Local Answer Log List Filter Select Handoff verification OK.');
`);

write('scripts/s133-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Select UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/select'],
  ['Select Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/select/status'],
  ['Select Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/select/entry'],
  ['Select API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/select'],
  ['Select Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/select/status'],
  ['Select Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/select/entry'],
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
pkg.scripts['phase133:3:verify'] = 'node scripts/v133-3.cjs';
pkg.scripts['phase133:3:smoke'] = 'node scripts/s133-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 133.3 Secure Master Local Answer Log List Filter Select Handoff patch applied.');
