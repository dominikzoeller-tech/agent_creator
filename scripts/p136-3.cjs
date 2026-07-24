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

write('README_PHASE136_3.md', `# Phase 136.3 - Secure Master Main Log List Browser Store Handoff

Finaler Handoff fuer Phase 136.

Phase 136 hat die browserseitige Speicherung direkt in die Haupt-Logliste integriert und dazu Status, Entry und Handoff ergaenzt.

## Gebaut

- Phase 136.0: Secure Master Main Log List Browser Store Integration
  - Store: frontend/lib/cmt-master-answer-log-list-main-browser-store.ts
  - API: /api/cmt/master/secure/main/log/list/main-browser-store
  - UI: /cmt/master/secure/main/log/list

- Phase 136.1: Secure Master Main Log List Browser Store Status
  - Store: frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts
  - API: /api/cmt/master/secure/main/log/list/main-browser-store/status
  - UI: /cmt/master/secure/main/log/list/main-browser-store/status

- Phase 136.2: Secure Master Main Log List Browser Store Entry
  - Store: frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts
  - API: /api/cmt/master/secure/main/log/list/main-browser-store/entry
  - UI: /cmt/master/secure/main/log/list/main-browser-store/entry

## Wirkung

Die Haupt-Logliste ist jetzt der bevorzugte lokale Testpunkt fuer Answer-Logs mit Browser-Speicher.

Sichtbar sind:

1. lokale Log-Eingaben.
2. Select-Filter.
3. Suche ueber inputPreview.
4. Speichern in Browser.
5. Laden nach Refresh.
6. Reset des Browser-Speichers.
7. localStorage-Key.
8. sourceCount.
9. filteredCount.
10. Safety State.
11. Persistence State.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/main-browser-store/status
- /cmt/master/secure/main/log/list/main-browser-store/entry
- /cmt/master/secure/main/log/list/browser-store
- /cmt/master/secure/main/log/list/browser-store/status
- /cmt/master/secure/main/log/list/browser-store/entry
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list

## Testchecks

- Haupt-Logliste erreichbar.
- Speichern in Browser direkt in Haupt-Logliste sichtbar.
- Laden nach Refresh vorbereitet.
- Reset direkt in Haupt-Logliste sichtbar.
- localStorage-Key sichtbar.
- mainLogListBrowserStoreIntegrated = true.
- saveButtonVisible = true.
- loadOnRefreshPrepared = true.
- resetButtonVisible = true.
- persistedInBrowser = browser_optional_local.
- persistedOnServer = false.
- serverStoragePrepared = false.
- externalSharingAllowed = false.

## Status

Der Secure Master Agent ist lokal testbar.

Die Haupt-Logliste ist jetzt fuer lokale Browser-Speicherung vorbereitet und erweitert.

Browserseitige Speicherung ist optional und lokal.

Serverseitige Speicherung ist nicht vorbereitet und nicht aktiv.

Noch kein Provider.

Noch kein Internet.

Noch kein Live-Modell.

## Persistence State

- localStoragePrepared = true
- storageKeyVisible = true
- saveButtonVisible = true
- loadOnRefreshPrepared = true
- resetButtonVisible = true
- persistedInBrowser = browser_optional_local
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

Phase 137.0: Lokalen JSON-Export fuer die Haupt-Logliste vorbereiten.

Ziel:

- Export-Button fuer lokale Logs vorbereiten.
- JSON-Payload mit Logs, Filtern, Persistence State und Safety State bereitstellen.
- Import spaeter vorbereiten.
- Browser-Speicher bleibt erhalten.
- persistedOnServer bleibt false.
- kein Provider.
- kein Internet.
- kein Live-Modell.
`);

write('scripts/v136-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE136_3.md', 'Phase 136.3'],
  ['README_PHASE136_3.md', 'Secure Master Main Log List Browser Store Integration'],
  ['README_PHASE136_3.md', 'Secure Master Main Log List Browser Store Status'],
  ['README_PHASE136_3.md', 'Secure Master Main Log List Browser Store Entry'],
  ['README_PHASE136_3.md', '/cmt/master/secure/main/log/list'],
  ['README_PHASE136_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list'],
  ['README_PHASE136_3.md', 'mainLogListBrowserStoreIntegrated = true'],
  ['README_PHASE136_3.md', 'saveButtonVisible = true'],
  ['README_PHASE136_3.md', 'loadOnRefreshPrepared = true'],
  ['README_PHASE136_3.md', 'resetButtonVisible = true'],
  ['README_PHASE136_3.md', 'persistedInBrowser = browser_optional_local'],
  ['README_PHASE136_3.md', 'persistedOnServer = false'],
  ['README_PHASE136_3.md', 'serverStoragePrepared = false'],
  ['README_PHASE136_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE136_3.md', 'Phase 137.0'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store.ts', 'createSecureMasterAnswerLogMainBrowserStore'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-status.ts', 'getSecureMasterAnswerLogMainBrowserStoreStatus'],
  ['frontend/lib/cmt-master-answer-log-list-main-browser-store-entry.ts', 'getSecureMasterAnswerLogMainBrowserStoreEntry'],
  ['package.json', 'phase136:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 136.3 Secure Master Main Log List Browser Store Handoff verification OK.');
`);

write('scripts/s136-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Main Log List UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list'],
  ['Main Browser Store Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/main-browser-store/status'],
  ['Main Browser Store Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/main-browser-store/entry'],
  ['Main Browser Store API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/main-browser-store'],
  ['Main Browser Store Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/main-browser-store/status'],
  ['Main Browser Store Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/main-browser-store/entry'],
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
pkg.scripts['phase136:3:verify'] = 'node scripts/v136-3.cjs';
pkg.scripts['phase136:3:smoke'] = 'node scripts/s136-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 136.3 Secure Master Main Log List Browser Store Handoff patch applied.');
