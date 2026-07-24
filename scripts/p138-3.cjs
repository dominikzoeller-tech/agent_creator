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

write('README_PHASE138_3.md', `# Phase 138.3 - Secure Master Answer Log JSON Import Handoff

Finaler Handoff fuer Phase 138.

Phase 138 hat den lokalen JSON-Import fuer die Haupt-Logliste vorbereitet und dazu Status, Entry und Handoff ergaenzt.

## Gebaut

- Phase 138.0: Secure Master Answer Log JSON Import Preparation
  - Store: frontend/lib/cmt-master-answer-log-list-json-import.ts
  - API: /api/cmt/master/secure/main/log/list/import-json
  - UI: /cmt/master/secure/main/log/list/import-json

- Phase 138.1: Secure Master Answer Log JSON Import Status
  - Store: frontend/lib/cmt-master-answer-log-list-json-import-status.ts
  - API: /api/cmt/master/secure/main/log/list/import-json/status
  - UI: /cmt/master/secure/main/log/list/import-json/status

- Phase 138.2: Secure Master Answer Log JSON Import Entry
  - Store: frontend/lib/cmt-master-answer-log-list-json-import-entry.ts
  - API: /api/cmt/master/secure/main/log/list/import-json/entry
  - UI: /cmt/master/secure/main/log/list/import-json/entry

## Wirkung

Die Haupt-Logliste hat jetzt einen lokalen JSON-Import-Pruefpunkt fuer Answer-Log-Exporte.

Sichtbar sind:

1. Import-Seite.
2. JSON-Eingabefeld.
3. Import Preview vorbereiten.
4. Schema-Pruefung.
5. Validation.
6. Import Preview.
7. Import-Status.
8. Import-Entry.
9. Import wird nicht automatisch angewendet.
10. Manuelle Anwendung ist fuer spaeter vorbereitet.
11. Browser-Speicher bleibt erhalten.
12. Server-Persistenz bleibt aus.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list/import-json
- /cmt/master/secure/main/log/list/import-json/status
- /cmt/master/secure/main/log/list/import-json/entry
- /cmt/master/secure/main/log/list/export-json
- /cmt/master/secure/main/log/list/export-json/status
- /cmt/master/secure/main/log/list
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list/import-json

## Export-Seite

- http://localhost:3001/cmt/master/secure/main/log/list/export-json

## Testchecks

- JSON-Import-Seite erreichbar.
- JSON-Import-Status erreichbar.
- JSON-Import-Entry erreichbar.
- Import-UI sichtbar.
- Import Preview vorbereiten sichtbar.
- Schema-Pruefung vorbereitet.
- Validation vorbereitet.
- Import Preview vorbereitet.
- importPrepared = true.
- importUiVisible = true.
- schemaCheckPrepared = true.
- importPreviewPrepared = true.
- validationPrepared = true.
- applyImportAutomatically = false.
- manualApplyRequiredLater = true.
- browserStorePreserved = true.
- persistedInBrowser = browser_optional_local.
- persistedOnServer = false.
- serverStoragePrepared = false.
- externalSharingAllowed = false.

## Status

Der Secure Master Agent ist lokal testbar.

Die Haupt-Logliste bleibt der bevorzugte Loglisten-Testpunkt.

Lokaler JSON-Export ist vorbereitet.

Lokaler JSON-Import ist als Pruefpunkt vorbereitet.

Import wird nicht automatisch angewendet.

Manuelle Anwendung ist fuer spaeter vorbereitet.

Serverseitige Speicherung ist nicht vorbereitet und nicht aktiv.

Noch kein Provider.

Noch kein Internet.

Noch kein Live-Modell.

## Import State

- importPrepared = true
- importUiVisible = true
- schemaCheckPrepared = true
- importPreviewPrepared = true
- validationPrepared = true
- applyImportAutomatically = false
- manualApplyRequiredLater = true
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

Phase 139.0: JSON-Import manuell in Browser-Speicher uebernehmen vorbereiten.

Ziel:

- Manuelle Apply-Schaltflaeche vorbereiten.
- Nur validierte Export-JSON-Daten in localStorage uebernehmen.
- Vor dem Anwenden Preview/Validation sichtbar halten.
- Kein automatischer Import.
- persistedOnServer bleibt false.
- kein Provider.
- kein Internet.
- kein Live-Modell.
`);

write('scripts/v138-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE138_3.md', 'Phase 138.3'],
  ['README_PHASE138_3.md', 'Secure Master Answer Log JSON Import Preparation'],
  ['README_PHASE138_3.md', 'Secure Master Answer Log JSON Import Status'],
  ['README_PHASE138_3.md', 'Secure Master Answer Log JSON Import Entry'],
  ['README_PHASE138_3.md', '/cmt/master/secure/main/log/list/import-json'],
  ['README_PHASE138_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/import-json'],
  ['README_PHASE138_3.md', 'importPrepared = true'],
  ['README_PHASE138_3.md', 'importUiVisible = true'],
  ['README_PHASE138_3.md', 'schemaCheckPrepared = true'],
  ['README_PHASE138_3.md', 'importPreviewPrepared = true'],
  ['README_PHASE138_3.md', 'validationPrepared = true'],
  ['README_PHASE138_3.md', 'applyImportAutomatically = false'],
  ['README_PHASE138_3.md', 'manualApplyRequiredLater = true'],
  ['README_PHASE138_3.md', 'browserStorePreserved = true'],
  ['README_PHASE138_3.md', 'persistedOnServer = false'],
  ['README_PHASE138_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE138_3.md', 'Phase 139.0'],
  ['frontend/lib/cmt-master-answer-log-list-json-import.ts', 'prepareSecureMasterAnswerLogJsonImport'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'getSecureMasterAnswerLogJsonImportStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'getSecureMasterAnswerLogJsonImportEntry'],
  ['package.json', 'phase138:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 138.3 Secure Master Answer Log JSON Import Handoff verification OK.');
`);

write('scripts/s138-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['JSON Import UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/import-json'],
  ['JSON Import Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/import-json/status'],
  ['JSON Import Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/import-json/entry'],
  ['JSON Import API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/import-json'],
  ['JSON Import Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/import-json/status'],
  ['JSON Import Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/import-json/entry'],
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
pkg.scripts['phase138:3:verify'] = 'node scripts/v138-3.cjs';
pkg.scripts['phase138:3:smoke'] = 'node scripts/s138-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 138.3 Secure Master Answer Log JSON Import Handoff patch applied.');
