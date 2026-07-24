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

write('README_PHASE137_3.md', `# Phase 137.3 - Secure Master Answer Log JSON Export Handoff

Finaler Handoff fuer Phase 137.

Phase 137 hat den lokalen JSON-Export fuer die Haupt-Logliste vorbereitet und dazu Status, Entry und Handoff ergaenzt.

## Gebaut

- Phase 137.0: Secure Master Answer Log JSON Export
  - Store: frontend/lib/cmt-master-answer-log-list-json-export.ts
  - API: /api/cmt/master/secure/main/log/list/export-json
  - UI: /cmt/master/secure/main/log/list/export-json

- Phase 137.1: Secure Master Answer Log JSON Export Status
  - Store: frontend/lib/cmt-master-answer-log-list-json-export-status.ts
  - API: /api/cmt/master/secure/main/log/list/export-json/status
  - UI: /cmt/master/secure/main/log/list/export-json/status

- Phase 137.2: Secure Master Answer Log JSON Export Entry
  - Store: frontend/lib/cmt-master-answer-log-list-json-export-entry.ts
  - API: /api/cmt/master/secure/main/log/list/export-json/entry
  - UI: /cmt/master/secure/main/log/list/export-json/entry

## Wirkung

Die Haupt-Logliste hat jetzt einen lokalen JSON-Exportpunkt fuer Answer-Logs.

Sichtbar sind:

1. Export-Seite.
2. Export-Button.
3. JSON-Download.
4. JSON Preview.
5. Logs im JSON-Payload.
6. Filter im JSON-Payload.
7. Persistence State im JSON-Payload.
8. Safety State im JSON-Payload.
9. Import ist fuer spaeter vorbereitet.
10. Browser-Speicher bleibt erhalten.
11. Server-Persistenz bleibt aus.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list/export-json
- /cmt/master/secure/main/log/list/export-json/status
- /cmt/master/secure/main/log/list/export-json/entry
- /cmt/master/secure/main/log/list
- /cmt/master/secure/main/log/list/main-browser-store/status
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list/export-json

## Haupt-Logliste

- http://localhost:3001/cmt/master/secure/main/log/list

## Testchecks

- JSON-Export-Seite erreichbar.
- JSON-Export-Status erreichbar.
- JSON-Export-Entry erreichbar.
- Export-Button sichtbar.
- JSON herunterladen sichtbar.
- JSON Preview sichtbar.
- exportPrepared = true.
- exportButtonVisible = true.
- jsonPayloadPrepared = true.
- downloadPrepared = true.
- importPreparedLater = true.
- includesLogs = true.
- includesFilters = true.
- includesPersistenceState = true.
- includesSafetyState = true.
- browserStorePreserved = true.
- persistedInBrowser = browser_optional_local.
- persistedOnServer = false.
- serverStoragePrepared = false.
- externalSharingAllowed = false.

## Status

Der Secure Master Agent ist lokal testbar.

Die Haupt-Logliste bleibt der bevorzugte Loglisten-Testpunkt.

Lokaler JSON-Export ist vorbereitet.

JSON-Download ist vorbereitet.

Import ist noch nicht aktiv, nur fuer spaeter vorbereitet.

Serverseitige Speicherung ist nicht vorbereitet und nicht aktiv.

Noch kein Provider.

Noch kein Internet.

Noch kein Live-Modell.

## Export State

- exportPrepared = true
- exportButtonVisible = true
- jsonPayloadPrepared = true
- downloadPrepared = true
- importPreparedLater = true
- includesLogs = true
- includesFilters = true
- includesPersistenceState = true
- includesSafetyState = true
- browserStorePreserved = true
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

Phase 138.0: Lokalen JSON-Import fuer die Haupt-Logliste vorbereiten.

Ziel:

- Import-UI fuer lokale JSON-Exporte vorbereiten.
- Schema-Pruefung vorbereiten.
- Import Preview vorbereiten.
- Import noch nicht automatisch anwenden.
- Browser-Speicher bleibt erhalten.
- persistedOnServer bleibt false.
- kein Provider.
- kein Internet.
- kein Live-Modell.
`);

write('scripts/v137-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE137_3.md', 'Phase 137.3'],
  ['README_PHASE137_3.md', 'Secure Master Answer Log JSON Export'],
  ['README_PHASE137_3.md', 'Secure Master Answer Log JSON Export Status'],
  ['README_PHASE137_3.md', 'Secure Master Answer Log JSON Export Entry'],
  ['README_PHASE137_3.md', '/cmt/master/secure/main/log/list/export-json'],
  ['README_PHASE137_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/export-json'],
  ['README_PHASE137_3.md', 'exportPrepared = true'],
  ['README_PHASE137_3.md', 'exportButtonVisible = true'],
  ['README_PHASE137_3.md', 'jsonPayloadPrepared = true'],
  ['README_PHASE137_3.md', 'downloadPrepared = true'],
  ['README_PHASE137_3.md', 'importPreparedLater = true'],
  ['README_PHASE137_3.md', 'includesLogs = true'],
  ['README_PHASE137_3.md', 'includesFilters = true'],
  ['README_PHASE137_3.md', 'includesPersistenceState = true'],
  ['README_PHASE137_3.md', 'includesSafetyState = true'],
  ['README_PHASE137_3.md', 'persistedOnServer = false'],
  ['README_PHASE137_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE137_3.md', 'Phase 138.0'],
  ['frontend/lib/cmt-master-answer-log-list-json-export.ts', 'createSecureMasterAnswerLogJsonExport'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-status.ts', 'getSecureMasterAnswerLogJsonExportStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-export-entry.ts', 'getSecureMasterAnswerLogJsonExportEntry'],
  ['package.json', 'phase137:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 137.3 Secure Master Answer Log JSON Export Handoff verification OK.');
`);

write('scripts/s137-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['JSON Export UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/export-json'],
  ['JSON Export Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/export-json/status'],
  ['JSON Export Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/export-json/entry'],
  ['JSON Export API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/export-json'],
  ['JSON Export Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/export-json/status'],
  ['JSON Export Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/export-json/entry'],
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
pkg.scripts['phase137:3:verify'] = 'node scripts/v137-3.cjs';
pkg.scripts['phase137:3:smoke'] = 'node scripts/s137-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 137.3 Secure Master Answer Log JSON Export Handoff patch applied.');
