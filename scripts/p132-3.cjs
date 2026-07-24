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

write('README_PHASE132_3.md', `# Phase 132.3 - Secure Master Local Answer Log List Filter Options Handoff

Finaler Handoff fuer Phase 132.

Phase 132 hat lokale Filter-Dropdown-Optionen aus der In-Memory-Logliste abgeleitet und Status, Entry und Handoff fuer die Optionsansicht ergaenzt.

## Gebaut

- Phase 132.0: Secure Master Local Answer Log List Filter Options
  - Store: frontend/lib/cmt-master-answer-log-list-filter-options.ts
  - API: /api/cmt/master/secure/main/log/list/filter/options
  - UI: /cmt/master/secure/main/log/list/filter/options

- Phase 132.1: Secure Master Local Answer Log List Filter Options Status
  - Store: frontend/lib/cmt-master-answer-log-list-filter-options-status.ts
  - API: /api/cmt/master/secure/main/log/list/filter/options/status
  - UI: /cmt/master/secure/main/log/list/filter/options/status

- Phase 132.2: Secure Master Local Answer Log List Filter Options Entry
  - Store: frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts
  - API: /api/cmt/master/secure/main/log/list/filter/options/entry
  - UI: /cmt/master/secure/main/log/list/filter/options/entry

## Wirkung

Der Secure Master kann jetzt lokale Dropdown-Optionen aus Loglisten ableiten fuer:

1. Routes.
2. Intents.
3. Privacy-Entscheidungen.
4. all als erste Option.
5. sourceCount.
6. items.
7. Safety State.
8. Persistence State.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list/filter/options
- /cmt/master/secure/main/log/list/filter/options/status
- /cmt/master/secure/main/log/list/filter/options/entry
- /cmt/master/secure/main/log/list/filter
- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list/filter/options

## Testchecks

- routes[0] = all
- intents[0] = all
- privacyDecisions[0] = all
- sourceCount > 0
- persistedInBrowser = false
- persistedOnServer = false
- externalSharingAllowed = false

## Status

Der Secure Master Agent ist lokal testbar.

Die Filter-Options-Ansicht ist sichtbar.

Route-Optionen sind sichtbar.

Intent-Optionen sind sichtbar.

Privacy-Optionen sind sichtbar.

all wird immer vorangestellt.

sourceCount ist sichtbar.

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

Phase 133.0: Dropdown-Optionen in die bestehende lokale Filterseite integrieren.

Ziel:

- Route-Filter als Select nutzen.
- Intent-Filter als Select nutzen.
- Privacy-Filter als Select nutzen.
- Options-Ableitung wiederverwenden.
- Suche ueber inputPreview behalten.
- keine Persistenz.
- kein Provider.
- kein Internet.
- kein Live-Modell.
`);

write('scripts/v132-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE132_3.md', 'Phase 132.3'],
  ['README_PHASE132_3.md', 'Secure Master Local Answer Log List Filter Options'],
  ['README_PHASE132_3.md', 'Secure Master Local Answer Log List Filter Options Status'],
  ['README_PHASE132_3.md', 'Secure Master Local Answer Log List Filter Options Entry'],
  ['README_PHASE132_3.md', '/cmt/master/secure/main/log/list/filter/options'],
  ['README_PHASE132_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/filter/options'],
  ['README_PHASE132_3.md', 'routes[0] = all'],
  ['README_PHASE132_3.md', 'persistedInBrowser = false'],
  ['README_PHASE132_3.md', 'persistedOnServer = false'],
  ['README_PHASE132_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE132_3.md', 'Phase 133.0'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options.ts', 'deriveSecureMasterAnswerLogListFilterOptions'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'getSecureMasterAnswerLogListFilterOptionsStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'getSecureMasterAnswerLogListFilterOptionsEntry'],
  ['package.json', 'phase132:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 132.3 Secure Master Local Answer Log List Filter Options Handoff verification OK.');
`);

write('scripts/s132-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Options UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/options'],
  ['Options Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/options/status'],
  ['Options Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/options/entry'],
  ['Options API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/options'],
  ['Options Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/options/status'],
  ['Options Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/options/entry'],
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
pkg.scripts['phase132:3:verify'] = 'node scripts/v132-3.cjs';
pkg.scripts['phase132:3:smoke'] = 'node scripts/s132-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 132.3 Secure Master Local Answer Log List Filter Options Handoff patch applied.');
