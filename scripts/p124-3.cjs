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

write('README_PHASE124_3.md', `# Phase 124.3 - Secure Master Quality Handoff

Finaler Handoff fuer Phase 124.

Phase 124 hat die lokale Antwortqualitaet des Secure Master Agent verbessert und sichtbar testbar gemacht.

## Gebaut

- Phase 124.0: Secure Master Local Answer Quality
  - Store: frontend/lib/cmt-master-quality.ts
  - API: /api/cmt/master/secure/quality
  - UI: /cmt/master/secure/quality

- Phase 124.1: Secure Master Quality Status
  - Store: frontend/lib/cmt-master-quality-status.ts
  - API: /api/cmt/master/secure/quality/status
  - UI: /cmt/master/secure/quality/status

- Phase 124.2: Secure Master Quality Entry
  - Store: frontend/lib/cmt-master-quality-entry.ts
  - API: /api/cmt/master/secure/quality/entry
  - UI: /cmt/master/secure/quality/entry

## Wirkung

Der Secure Master erkennt lokal jetzt besser:

- general
- live_switch
- internal_data
- committee_decision
- tool_required
- agent_builder
- project_next_step

## Wichtigste Testseiten

- /cmt/master/secure/quality
- /cmt/master/secure/quality/status
- /cmt/master/secure/quality/entry
- /cmt/master/secure

## Aktueller Haupt-Testpunkt

- http://localhost:3001/cmt/master/secure/quality

## Status

Der Secure Master Agent ist lokal testbar.

Die lokale Antwortqualitaet ist verbessert.

Der Agent ist noch nicht live mit KI-Modell.

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

Phase 125.0: 5er-Gremium direkt in Secure Master integrieren.

Ziel:

- Bei Gremiumsfragen nicht nur committee_decision erkennen.
- Die 5 Rollen direkt in der Secure-Master-Antwort anzeigen.
- Pro Rolle eine kurze lokale Einschätzung ausgeben.
- Danach eine klare zusammengefasste Empfehlung zeigen.

Noch kein Provider in Phase 125.0.
`);

write('scripts/v124-3.cjs', `const fs = require('fs');
const checks = [
  ['README_PHASE124_3.md', 'Phase 124.3'],
  ['README_PHASE124_3.md', 'Secure Master Local Answer Quality'],
  ['README_PHASE124_3.md', 'Secure Master Quality Status'],
  ['README_PHASE124_3.md', 'Secure Master Quality Entry'],
  ['README_PHASE124_3.md', '/cmt/master/secure/quality'],
  ['README_PHASE124_3.md', 'http://localhost:3001/cmt/master/secure/quality'],
  ['README_PHASE124_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE124_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE124_3.md', 'Phase 125.0'],
  ['frontend/lib/cmt-master-quality.ts', 'askSecureMasterQuality'],
  ['frontend/lib/cmt-master-quality-status.ts', 'getSecureMasterQualityStatus'],
  ['frontend/lib/cmt-master-quality-entry.ts', 'getSecureMasterQualityEntry'],
  ['package.json', 'phase124:3:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 124.3 Secure Master Quality Handoff verification OK.');
`);

write('scripts/s124-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Quality UI', 'http://localhost:' + port + '/cmt/master/secure/quality'],
  ['Quality Status UI', 'http://localhost:' + port + '/cmt/master/secure/quality/status'],
  ['Quality Entry UI', 'http://localhost:' + port + '/cmt/master/secure/quality/entry'],
  ['Quality API', 'http://localhost:' + port + '/api/cmt/master/secure/quality'],
  ['Quality Status API', 'http://localhost:' + port + '/api/cmt/master/secure/quality/status'],
  ['Quality Entry API', 'http://localhost:' + port + '/api/cmt/master/secure/quality/entry'],
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
pkg.scripts['phase124:3:verify'] = 'node scripts/v124-3.cjs';
pkg.scripts['phase124:3:smoke'] = 'node scripts/s124-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 124.3 Secure Master Quality Handoff patch applied.');
