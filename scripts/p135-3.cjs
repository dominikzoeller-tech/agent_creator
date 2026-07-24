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

write('README_PHASE135_3.md', `# Phase 135.3 - Secure Master Browser Log Store Handoff

Finaler Handoff fuer Phase 135.

Phase 135 hat die browserseitige lokale Speicherung fuer die Haupt-Logliste vorbereitet und dazu Status, Entry und Handoff ergaenzt.

## Gebaut

- Phase 135.0: Secure Master Browser Log Store Preparation
  - Store: frontend/lib/cmt-master-answer-log-list-browser-store.ts
  - API: /api/cmt/master/secure/main/log/list/browser-store
  - UI: /cmt/master/secure/main/log/list/browser-store

- Phase 135.1: Secure Master Browser Log Store Status
  - Store: frontend/lib/cmt-master-answer-log-list-browser-store-status.ts
  - API: /api/cmt/master/secure/main/log/list/browser-store/status
  - UI: /cmt/master/secure/main/log/list/browser-store/status

- Phase 135.2: Secure Master Browser Log Store Entry
  - Store: frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts
  - API: /api/cmt/master/secure/main/log/list/browser-store/entry
  - UI: /cmt/master/secure/main/log/list/browser-store/entry

## Wirkung

Der Secure Master hat jetzt eine vorbereitete browserseitige Logspeicherung fuer lokale Answer-Logs.

Sichtbar sind:

1. localStorage-Key.
2. Speichern in Browser vorbereitet.
3. Laden aus Browser vorbereitet.
4. Loeschen/Reset vorbereitet.
5. Browser-Store-Status.
6. Browser-Store-Entry.
7. Haupt-Logliste bleibt bevorzugter Testpunkt.
8. Server-Persistenz bleibt aus.
9. Export ist fuer spaeter vorbereitet.
10. Safety State.
11. Persistence State.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list/browser-store
- /cmt/master/secure/main/log/list/browser-store/status
- /cmt/master/secure/main/log/list/browser-store/entry
- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/select/status
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list/browser-store

## Haupt-Logliste

- http://localhost:3001/cmt/master/secure/main/log/list

## Testchecks

- Browser-Store-Seite erreichbar.
- Browser-Store-Status erreichbar.
- Browser-Store-Entry erreichbar.
- localStorage-Key sichtbar.
- canSaveInBrowser = true.
- canLoadFromBrowser = true.
- canClearBrowserLogs = true.
- resetPrepared = true.
- exportPreparedLater = true.
- persistedInBrowser = prepared_not_auto_enabled.
- persistedOnServer = false.
- serverStoragePrepared = false.
- externalSharingAllowed = false.

## Status

Der Secure Master Agent ist lokal testbar.

Die Haupt-Logliste bleibt der bevorzugte Loglisten-Testpunkt.

Die browserseitige Speicherung ist vorbereitet.

Serverseitige Speicherung ist nicht vorbereitet und nicht aktiv.

Noch kein Provider.

Noch kein Internet.

Noch kein Live-Modell.

## Persistence State

- localStoragePrepared = true
- storageKeyVisible = true
- canSaveInBrowser = true
- canLoadFromBrowser = true
- canClearBrowserLogs = true
- resetPrepared = true
- exportPreparedLater = true
- persistedInBrowser = prepared_not_auto_enabled
- persistedOnServer = false
- serverStoragePrepared = false

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

Phase 136.0: Browserseitige Speicherung direkt in die Haupt-Logliste integrieren.

Ziel:

- /cmt/master/secure/main/log/list bekommt Speichern/Laden/Reset.
- Browser-Store-Kontrollseiten bleiben erhalten.
- persistedInBrowser bleibt als lokal/browserseitig kenntlich.
- persistedOnServer bleibt false.
- kein Provider.
- kein Internet.
- kein Live-Modell.
`);

write('scripts/v135-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE135_3.md', 'Phase 135.3'],
  ['README_PHASE135_3.md', 'Secure Master Browser Log Store Preparation'],
  ['README_PHASE135_3.md', 'Secure Master Browser Log Store Status'],
  ['README_PHASE135_3.md', 'Secure Master Browser Log Store Entry'],
  ['README_PHASE135_3.md', '/cmt/master/secure/main/log/list/browser-store'],
  ['README_PHASE135_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/browser-store'],
  ['README_PHASE135_3.md', 'localStorage-Key sichtbar'],
  ['README_PHASE135_3.md', 'canSaveInBrowser = true'],
  ['README_PHASE135_3.md', 'canLoadFromBrowser = true'],
  ['README_PHASE135_3.md', 'canClearBrowserLogs = true'],
  ['README_PHASE135_3.md', 'persistedInBrowser = prepared_not_auto_enabled'],
  ['README_PHASE135_3.md', 'persistedOnServer = false'],
  ['README_PHASE135_3.md', 'serverStoragePrepared = false'],
  ['README_PHASE135_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE135_3.md', 'Phase 136.0'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store.ts', 'createSecureMasterAnswerLogBrowserStore'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-status.ts', 'getSecureMasterAnswerLogBrowserStoreStatus'],
  ['frontend/lib/cmt-master-answer-log-list-browser-store-entry.ts', 'getSecureMasterAnswerLogBrowserStoreEntry'],
  ['package.json', 'phase135:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 135.3 Secure Master Browser Log Store Handoff verification OK.');
`);

write('scripts/s135-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Browser Store UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/browser-store'],
  ['Browser Store Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/browser-store/status'],
  ['Browser Store Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/browser-store/entry'],
  ['Browser Store API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/browser-store'],
  ['Browser Store Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/browser-store/status'],
  ['Browser Store Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/browser-store/entry'],
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
pkg.scripts['phase135:3:verify'] = 'node scripts/v135-3.cjs';
pkg.scripts['phase135:3:smoke'] = 'node scripts/s135-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 135.3 Secure Master Browser Log Store Handoff patch applied.');
