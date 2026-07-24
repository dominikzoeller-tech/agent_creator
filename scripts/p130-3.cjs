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

write('README_PHASE130_3.md', `# Phase 130.3 - Secure Master In-Memory Answer Log List Handoff

Finaler Handoff fuer Phase 130.

Phase 130 hat die lokale In-Memory-Logliste fuer mehrere Secure-Master-Anfragen eingefuehrt und Status, Entry und Handoff fuer die Logliste ergaenzt.

## Gebaut

- Phase 130.0: Secure Master In-Memory Answer Log List
  - Store: frontend/lib/cmt-master-answer-log-list.ts
  - API: /api/cmt/master/secure/main/log/list
  - UI: /cmt/master/secure/main/log/list

- Phase 130.1: Secure Master In-Memory Answer Log List Status
  - Store: frontend/lib/cmt-master-answer-log-list-status.ts
  - API: /api/cmt/master/secure/main/log/list/status
  - UI: /cmt/master/secure/main/log/list/status

- Phase 130.2: Secure Master In-Memory Answer Log List Entry
  - Store: frontend/lib/cmt-master-answer-log-list-entry.ts
  - API: /api/cmt/master/secure/main/log/list/entry
  - UI: /cmt/master/secure/main/log/list/entry

## Wirkung

Der Secure Master kann jetzt lokal mehrere Log-Objekte als Liste anzeigen:

1. count.
2. id.
3. createdAt.
4. inputPreview.
5. detectedIntent.
6. finalRoute.
7. privacyDecision.
8. badgeSummary length.
9. finalDispatchBlocked.
10. persistence flags.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/status
- /cmt/master/secure/main/log/list/entry
- /cmt/master/secure/main/log
- /cmt/master/secure/main/log/status
- /cmt/master/secure/main/log/entry
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list

## Status

Der Secure Master Agent ist lokal testbar.

Die In-Memory-Logliste ist sichtbar.

Mehrere lokale Protokollobjekte koennen angezeigt werden.

Die Liste nutzt das bestehende Einzel-Log aus Phase 129.

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

Phase 131.0: Logliste mit lokaler Filter- und Suchansicht vorbereiten.

Ziel:

- Logs nach Route, Intent und Privacy-Entscheidung filtern.
- einfache lokale Suche ueber inputPreview ergaenzen.
- keine dauerhafte Speicherung.
- kein Provider.
- kein Internet.
- kein Live-Modell.
`);

write('scripts/v130-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE130_3.md', 'Phase 130.3'],
  ['README_PHASE130_3.md', 'Secure Master In-Memory Answer Log List'],
  ['README_PHASE130_3.md', 'Secure Master In-Memory Answer Log List Status'],
  ['README_PHASE130_3.md', 'Secure Master In-Memory Answer Log List Entry'],
  ['README_PHASE130_3.md', '/cmt/master/secure/main/log/list'],
  ['README_PHASE130_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list'],
  ['README_PHASE130_3.md', 'persistedInBrowser = false'],
  ['README_PHASE130_3.md', 'persistedOnServer = false'],
  ['README_PHASE130_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE130_3.md', 'Phase 131.0'],
  ['frontend/lib/cmt-master-answer-log-list.ts', 'createSecureMasterAnswerLogList'],
  ['frontend/lib/cmt-master-answer-log-list-status.ts', 'getSecureMasterAnswerLogListStatus'],
  ['frontend/lib/cmt-master-answer-log-list-entry.ts', 'getSecureMasterAnswerLogListEntry'],
  ['package.json', 'phase130:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 130.3 Secure Master In-Memory Answer Log List Handoff verification OK.');
`);

write('scripts/s130-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Log List UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list'],
  ['Log List Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/status'],
  ['Log List Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/entry'],
  ['Log List API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list'],
  ['Log List Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/status'],
  ['Log List Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/entry'],
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
pkg.scripts['phase130:3:verify'] = 'node scripts/v130-3.cjs';
pkg.scripts['phase130:3:smoke'] = 'node scripts/s130-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 130.3 Secure Master In-Memory Answer Log List Handoff patch applied.');
