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

write('README_PHASE139_3.md', `# Phase 139.3 - Secure Master Answer Log JSON Import Manual Browser Apply Handoff

Finaler Handoff fuer Phase 139.

Phase 139 hat die manuelle Uebernahme validierter Export-JSON-Daten in den Browser-Speicher vorbereitet und dazu Status, Entry und Handoff ergaenzt.

## Gebaut

- Phase 139.0: Secure Master Answer Log JSON Import Manual Browser Apply Preparation
  - Store: frontend/lib/cmt-master-answer-log-list-json-import-apply.ts
  - API: /api/cmt/master/secure/main/log/list/import-json/apply
  - UI: /cmt/master/secure/main/log/list/import-json/apply

- Phase 139.1: Secure Master Answer Log JSON Import Manual Browser Apply Status
  - Store: frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts
  - API: /api/cmt/master/secure/main/log/list/import-json/apply/status
  - UI: /cmt/master/secure/main/log/list/import-json/apply/status

- Phase 139.2: Secure Master Answer Log JSON Import Manual Browser Apply Entry
  - Store: frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts
  - API: /api/cmt/master/secure/main/log/list/import-json/apply/entry
  - UI: /cmt/master/secure/main/log/list/import-json/apply/entry

## Wirkung

Die Haupt-Logliste kann jetzt ueber einen lokalen, manuellen Apply-Punkt mit validierten Export-JSON-Daten in den Browser-Speicher befuellt werden.

Sichtbar sind:

1. Manual-Apply-Seite.
2. Apply Preview vorbereiten.
3. Apply-Button.
4. Validation vor Apply.
5. Import Preview vor Apply.
6. Apply Payload Preview.
7. Manual-Apply-Status.
8. Manual-Apply-Entry.
9. localStorage-Write vorbereitet.
10. Apply nur bei parseOk=true und schemaOk=true.
11. Kein automatischer Import.
12. Server-Persistenz bleibt aus.

## Wichtigste Testseiten

- /cmt/master/secure/main/log/list/import-json/apply
- /cmt/master/secure/main/log/list/import-json/apply/status
- /cmt/master/secure/main/log/list/import-json/apply/entry
- /cmt/master/secure/main/log/list/import-json
- /cmt/master/secure/main/log/list/import-json/status
- /cmt/master/secure/main/log/list/export-json
- /cmt/master/secure/main/log/list
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log/list/import-json/apply

## Haupt-Logliste

- http://localhost:3001/cmt/master/secure/main/log/list

## Testchecks

- Manual-Apply-Seite erreichbar.
- Manual-Apply-Status erreichbar.
- Manual-Apply-Entry erreichbar.
- Apply Preview vorbereiten sichtbar.
- Validiertes JSON manuell in Browser speichern sichtbar.
- Validation vor Apply sichtbar.
- Import Preview vor Apply sichtbar.
- Apply Payload Preview sichtbar.
- manualApplyPrepared = true.
- applyButtonVisible = true.
- applyRequiresValidSchema = true.
- applyRequiresParseOk = true.
- applyImportAutomatically = false.
- previewVisibleBeforeApply = true.
- validationVisibleBeforeApply = true.
- localStorageWritePrepared = true.
- browserStorePreserved = true.
- persistedInBrowser = browser_optional_local_after_manual_apply.
- persistedOnServer = false.
- serverStoragePrepared = false.
- externalSharingAllowed = false.

## Status

Der Secure Master Agent ist lokal testbar.

Die Haupt-Logliste bleibt der bevorzugte Loglisten-Testpunkt.

Lokaler JSON-Export ist vorbereitet.

Lokaler JSON-Import ist vorbereitet.

Manuelle Browser-Uebernahme ist vorbereitet.

Import wird nicht automatisch angewendet.

Nur validierte Export-JSON-Daten duerfen manuell uebernommen werden.

Serverseitige Speicherung ist nicht vorbereitet und nicht aktiv.

Noch kein Provider.

Noch kein Internet.

Noch kein Live-Modell.

## Apply State

- manualApplyPrepared = true
- applyButtonVisible = true
- applyRequiresValidSchema = true
- applyRequiresParseOk = true
- applyImportAutomatically = false
- previewVisibleBeforeApply = true
- validationVisibleBeforeApply = true
- localStorageWritePrepared = true
- browserStorePreserved = true
- persistedInBrowser = browser_optional_local_after_manual_apply
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

Phase 140.0: Haupt-Logliste nach manuellem JSON-Apply aus Browser-Speicher laden.

Ziel:

- Haupt-Logliste liest manuell angewendete Import-Payloads aus localStorage.
- Anzeige kennzeichnet Quelle manual_json_import_apply.
- Keine automatische externe Weitergabe.
- persistedOnServer bleibt false.
- kein Provider.
- kein Internet.
- kein Live-Modell.
`);

write('scripts/v139-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE139_3.md', 'Phase 139.3'],
  ['README_PHASE139_3.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Preparation'],
  ['README_PHASE139_3.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Status'],
  ['README_PHASE139_3.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Entry'],
  ['README_PHASE139_3.md', '/cmt/master/secure/main/log/list/import-json/apply'],
  ['README_PHASE139_3.md', 'http://localhost:3001/cmt/master/secure/main/log/list/import-json/apply'],
  ['README_PHASE139_3.md', 'manualApplyPrepared = true'],
  ['README_PHASE139_3.md', 'applyButtonVisible = true'],
  ['README_PHASE139_3.md', 'applyRequiresValidSchema = true'],
  ['README_PHASE139_3.md', 'applyRequiresParseOk = true'],
  ['README_PHASE139_3.md', 'applyImportAutomatically = false'],
  ['README_PHASE139_3.md', 'previewVisibleBeforeApply = true'],
  ['README_PHASE139_3.md', 'validationVisibleBeforeApply = true'],
  ['README_PHASE139_3.md', 'localStorageWritePrepared = true'],
  ['README_PHASE139_3.md', 'persistedOnServer = false'],
  ['README_PHASE139_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE139_3.md', 'Phase 140.0'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply.ts', 'prepareSecureMasterAnswerLogJsonImportApply'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'getSecureMasterAnswerLogJsonImportApplyStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'getSecureMasterAnswerLogJsonImportApplyEntry'],
  ['package.json', 'phase139:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 139.3 Secure Master Answer Log JSON Import Manual Browser Apply Handoff verification OK.');
`);

write('scripts/s139-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Manual Apply UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/import-json/apply'],
  ['Manual Apply Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/import-json/apply/status'],
  ['Manual Apply Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/list/import-json/apply/entry'],
  ['Manual Apply API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/import-json/apply'],
  ['Manual Apply Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/import-json/apply/status'],
  ['Manual Apply Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/list/import-json/apply/entry'],
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
pkg.scripts['phase139:3:verify'] = 'node scripts/v139-3.cjs';
pkg.scripts['phase139:3:smoke'] = 'node scripts/s139-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 139.3 Secure Master Answer Log JSON Import Manual Browser Apply Handoff patch applied.');
