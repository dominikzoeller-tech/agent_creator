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

write('README_PHASE129_3.md', `# Phase 129.3 - Secure Master Local Answer Log Handoff

Finaler Handoff fuer Phase 129.

Phase 129 hat ein lokales Antwortprotokoll fuer den Secure Master eingefuehrt und Status, Entry und Handoff fuer das Answer Log ergaenzt.

## Gebaut

- Phase 129.0: Secure Master Local Answer Log
  - Store: frontend/lib/cmt-master-answer-log.ts
  - API: /api/cmt/master/secure/main/log
  - UI: /cmt/master/secure/main/log

- Phase 129.1: Secure Master Local Answer Log Status
  - Store: frontend/lib/cmt-master-answer-log-status.ts
  - API: /api/cmt/master/secure/main/log/status
  - UI: /cmt/master/secure/main/log/status

- Phase 129.2: Secure Master Local Answer Log Entry
  - Store: frontend/lib/cmt-master-answer-log-entry.ts
  - API: /api/cmt/master/secure/main/log/entry
  - UI: /cmt/master/secure/main/log/entry

## Wirkung

Der Secure Master kann jetzt lokal pro Anfrage ein Log-Objekt erzeugen mit:

1. id.
2. createdAt.
3. inputPreview.
4. option.
5. detectedIntent.
6. finalRoute.
7. privacyDecision.
8. badgeSummary.
9. safety.
10. persistence flags.

## Wichtigste Testseiten

- /cmt/master/secure/main/log
- /cmt/master/secure/main/log/status
- /cmt/master/secure/main/log/entry
- /cmt/master/secure
- /cmt/master/secure/main/view/status
- /cmt/master/secure/main/view/entry

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/main/log

## Status

Der Secure Master Agent ist lokal testbar.

Das lokale Antwortprotokoll ist sichtbar.

Pro Anfrage kann ein lokales Protokollobjekt erzeugt werden.

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

Phase 130.0: Lokale In-Memory-Logliste fuer mehrere Secure-Master-Anfragen vorbereiten.

Ziel:

- mehrere lokale Logs in einer In-Memory-Liste anzeigen.
- keine dauerhafte Speicherung.
- Logliste als Kontrollseite bauen.
- bestehendes Einzel-Log behalten.
- Noch kein Provider.
- Kein Internet.
- Kein Live-Modell.
`);

write('scripts/v129-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE129_3.md', 'Phase 129.3'],
  ['README_PHASE129_3.md', 'Secure Master Local Answer Log'],
  ['README_PHASE129_3.md', 'Secure Master Local Answer Log Status'],
  ['README_PHASE129_3.md', 'Secure Master Local Answer Log Entry'],
  ['README_PHASE129_3.md', '/cmt/master/secure/main/log'],
  ['README_PHASE129_3.md', 'http://localhost:3001/cmt/master/secure/main/log'],
  ['README_PHASE129_3.md', 'persistedInBrowser = false'],
  ['README_PHASE129_3.md', 'persistedOnServer = false'],
  ['README_PHASE129_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE129_3.md', 'Phase 130.0'],
  ['frontend/lib/cmt-master-answer-log.ts', 'createSecureMasterAnswerLog'],
  ['frontend/lib/cmt-master-answer-log-status.ts', 'getSecureMasterAnswerLogStatus'],
  ['frontend/lib/cmt-master-answer-log-entry.ts', 'getSecureMasterAnswerLogEntry'],
  ['package.json', 'phase129:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 129.3 Secure Master Local Answer Log Handoff verification OK.');
`);

write('scripts/s129-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Answer Log UI', 'http://localhost:' + port + '/cmt/master/secure/main/log'],
  ['Answer Log Status UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/status'],
  ['Answer Log Entry UI', 'http://localhost:' + port + '/cmt/master/secure/main/log/entry'],
  ['Answer Log API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log'],
  ['Answer Log Status API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/status'],
  ['Answer Log Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/main/log/entry'],
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
pkg.scripts['phase129:3:verify'] = 'node scripts/v129-3.cjs';
pkg.scripts['phase129:3:smoke'] = 'node scripts/s129-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 129.3 Secure Master Local Answer Log Handoff patch applied.');
