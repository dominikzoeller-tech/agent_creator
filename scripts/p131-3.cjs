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

write('README_PHASE131_3.md', `# Phase 131.3 - Secure Master Local Answer Log List Filter Handoff

Finaler Handoff fuer Phase 131.

Phase 131 hat lokale Suche und Filter fuer die In-Memory-Logliste eingefuehrt und Status, Entry und Handoff fuer die Filteransicht ergaenzt.

## Gebaut

- Phase 131.0: Secure Master Local Answer Log List Filter
  - Store: frontend/lib/cmt-master-answer-log-list-filter.ts
  - API: /api/cmt/master/secure/main/log/list/filter
  - UI: /cmt/master/secure/main/log/list/filter

- Phase 131.1: Secure Master Local Answer Log List Filter Status
  - Store: frontend/lib/cmt-master-answer-log-list-filter-status.ts
  - API: /api/cmt/master/secure/main/log/list/filter/status
  - UI: /cmt/master/secure/main/log/list/filter/status

- Phase 131.2: Secure Master Local Answer Log List Filter Entry
  - Store: frontend/lib/cmt-master-answer-log-list-filter-entry.ts
  - API: /api/cmt/master/secure/main/log/list/filter/entry
  - UI: /cmt/master/secure/main/log/list/filter/entry

## Wirkung

Der Secure Master kann jetzt lokale Loglisten filtern nach:

1. inputPreview-Suche.
2. Route.
3. Intent.
4. Privacy-Entscheidung.
5. sourceCount.
6. filteredCount.
7. gefilterten Items.
8. Safety State.
9. Persistence State.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list/filter
- /cmt/master/secure/main/log/list/filter/status
- /cmt/master/secure/main/log/list/filter/entry
- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list/filter

## Testfilter

- search=intern
- search=Gremium
- search=Trading
- route=all
- intent=all
- privacyDecision=all
- privacyDecision=local_only

## Status

Der Secure Master Agent ist lokal testbar.

Die lokale Filteransicht ist sichtbar.

Suche ueber inputPreview ist sichtbar.

Route-, Intent- und Privacy-Filter sind sichtbar.

sourceCount und filteredCount sind sichtbar.

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

Phase 132.0: Filterwerte als lokale Dropdown-Optionen aus der Logliste ableiten.

Ziel:

- verfügbare Routes aus Logs ableiten.
- verfügbare Intents aus Logs ableiten.
- verfügbare Privacy-Entscheidungen aus Logs ableiten.
- Filterseite dadurch bedienbarer machen.
- keine Persistenz.
- kein Provider.
- kein Internet.
- kein Live-Modell.
`);

write('scripts/v131-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE131_3.md', 'Phase 131.3'],
  ['README_PHASE131_3.md', 'Secure Master Local Answer Log List Filter'],
  ['README_PHASE131_3.md', 'Secure Master Local Answer Log List Filter Status'],
  ['README_PHASE131_3.md', 'Secure Master Local Answer Log List Filter Entry'],
  ['README_PHASE131_3.md', '/cmt/master/secure/main/log/list/filter'],
  ['README_PHASE131_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/filter'],
  ['README_PHASE131_3.md', 'persistedInBrowser = false'],
  ['README_PHASE131_3.md', 'persistedOnServer = false'],
  ['README_PHASE131_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE131_3.md', 'Phase 132.0'],
  ['frontend/lib/cmt-master-answer-log-list-filter.ts', 'filterSecureMasterAnswerLogList'],
  ['frontend/lib/cmt-master-answer-log-list-filter-status.ts', 'getSecureMasterAnswerLogListFilterStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-entry.ts', 'getSecureMasterAnswerLogListFilterEntry'],
  ['package.json', 'phase131:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 131.3 Secure Master Local Answer Log List Filter Handoff verification OK.');
`);

write('scripts/s131-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Filter UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter'],
  ['Filter Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/status'],
  ['Filter Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/filter/entry'],
  ['Filter API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter'],
  ['Filter Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/status'],
  ['Filter Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/filter/entry'],
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
pkg.scripts['phase131:3:verify'] = 'node scripts/v131-3.cjs';
pkg.scripts['phase131:3:smoke'] = 'node scripts/s131-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 131.3 Secure Master Local Answer Log List Filter Handoff patch applied.');
