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

write('README_PHASE122_3.md', `# Phase 122.3 - Secure Master Agent Handoff

Finaler Handoff fuer Phase 122.

Phase 122 hat den Master-Agenten mit Datenschutz-Gate lokal zusammengeführt.

## Gebaut

- Phase 122.0: Secure Master Agent MVP
  - Store: frontend/lib/cmt-master-secure.ts
  - API: /api/cmt/master/secure
  - UI: /cmt/master/secure

- Phase 122.1: Secure Master Agent Status
  - Store: frontend/lib/cmt-master-secure-status.ts
  - API: /api/cmt/master/secure/status
  - UI: /cmt/master/secure/status

- Phase 122.2: Secure Master Agent Guide
  - Store: frontend/lib/cmt-master-secure-guide.ts
  - API: /api/cmt/master/secure/guide
  - UI: /cmt/master/secure/guide

## Wirkung

Der Agent hat jetzt lokal:

1. Einen sicheren Master-Agent-Einstieg.
2. Master-Routing fuer direct, committee, privacy_gate, tool_required und agent_builder.
3. Privacy-Gate-Pruefung vor der Master-Entscheidung.
4. Privacy-Decision-Flow mit local_only, anonymize_then_send, approve_external_send und cancel.
5. Blockierte externe Weitergabe.
6. Einen Guide mit Testfragen und erwarteten Verhalten.

## Lokale Testseite

Aktueller Haupt-Testpunkt:

- /cmt/master/secure

Weitere Seiten:

- /cmt/master/secure/status
- /cmt/master/secure/guide
- /cmt/privacy
- /cmt/privacy/decision
- /cmt/ask

## Status

Der Master-Agent ist lokal testbar.

Der Master-Agent ist noch nicht live mit KI-Modell.

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

## Was noch fehlt vor Live-Schaltung

Vor einer echten Live-Schaltung brauchen wir mindestens:

1. Haupt-Einstieg in Navigation/Home sauber sichtbar machen.
2. Lokale Antwortqualitaet verbessern.
3. Gremiumsantworten direkt im Secure Master anzeigen.
4. Provider-Readiness vorbereiten, aber weiterhin blockiert halten.
5. Separate Live-Freigabe und Env-Konfiguration.

## Naechster sinnvoller Schritt

Phase 123.0: Secure Master als Haupt-Einstieg integrieren.

Ziel:

- nicht mehr zwischen vielen Seiten suchen muessen
- zentrale Test- und Arbeitsseite klar erreichbar machen
- /cmt/master/secure als wichtigsten lokalen Testpunkt sichtbar verlinken

Noch kein Provider in Phase 123.0.
`);

write('scripts/v122-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE122_3.md', 'Phase 122.3'],
  ['README_PHASE122_3.md', 'Secure Master Agent MVP'],
  ['README_PHASE122_3.md', 'Secure Master Agent Status'],
  ['README_PHASE122_3.md', 'Secure Master Agent Guide'],
  ['README_PHASE122_3.md', '/cmt/master/secure'],
  ['README_PHASE122_3.md', 'Master-Agent ist lokal testbar'],
  ['README_PHASE122_3.md', 'noch nicht live mit KI-Modell'],
  ['README_PHASE122_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE122_3.md', 'providerDispatchAllowed = false'],
  ['README_PHASE122_3.md', 'Phase 123.0'],
  ['frontend/lib/cmt-master-secure.ts', 'askSecureMasterAgent'],
  ['frontend/lib/cmt-master-secure-status.ts', 'getSecureMasterStatus'],
  ['frontend/lib/cmt-master-secure-guide.ts', 'getSecureMasterGuide'],
  ['package.json', 'phase122:3:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    console.error('MISS', file);
    ok = false;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) {
    console.error('MISS fragment', fragment, 'in', file);
    ok = false;
  } else {
    console.log('OK', file, fragment);
  }
}

if (!ok) process.exit(1);
console.log('Phase 122.3 Secure Master Agent Handoff verification OK.');
`);

write('scripts/s122-3.cjs', `const http = require('http');
const port = process.env.PORT || '3000';
const urls = [
  ['Secure Master UI', 'http://localhost:' + port + '/cmt/master/secure'],
  ['Secure Master Status UI', 'http://localhost:' + port + '/cmt/master/secure/status'],
  ['Secure Master Guide UI', 'http://localhost:' + port + '/cmt/master/secure/guide'],
  ['Secure Master API', 'http://localhost:' + port + '/api/cmt/master/secure'],
  ['Secure Master Status API', 'http://localhost:' + port + '/api/cmt/master/secure/status'],
  ['Secure Master Guide API', 'http://localhost:' + port + '/api/cmt/master/secure/guide'],
];

function check(label, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ': ' + res.statusCode + ' ' + url);
      resolve(ok);
    });
    req.on('error', () => {
      console.log('FAIL ' + label + ': ' + url);
      resolve(false);
    });
    req.setTimeout(8000, () => {
      req.destroy();
      console.log('FAIL ' + label + ': timeout ' + url);
      resolve(false);
    });
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
pkg.scripts['phase122:3:verify'] = 'node scripts/v122-3.cjs';
pkg.scripts['phase122:3:smoke'] = 'node scripts/s122-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 122.3 Secure Master Agent Handoff patch applied.');
