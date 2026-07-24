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

write('README_PHASE120_3.md', `# Phase 120.3 - Master Agent Router Handoff

Finaler Handoff fuer Phase 120.

Phase 120 hat den lokalen Master-Agent-Router aufgebaut und den Master-Agenten als zentralen Einstieg vorbereitet.

## Gebaut

- Phase 120.0: Master Agent Router MVP
  - Store: frontend/lib/cmt-master.ts
  - API: /api/cmt/master
  - UI: /cmt/master

- Phase 120.1: Master Agent Router Status
  - Store: frontend/lib/cmt-master-status.ts
  - API: /api/cmt/master/status
  - UI: /cmt/master/status

- Phase 120.2: Master Agent Entry
  - Store: frontend/lib/cmt-master-entry.ts
  - API: /api/cmt/master/entry
  - UI: /cmt/master/entry

## Wirkung

Der Agent hat jetzt lokal und simuliert:

1. Einen zentralen Master-Agent-Router.
2. Lokale Routing-Entscheidungen: direct, committee, privacy_gate, tool_required, agent_builder.
3. Ein Privacy-Gate fuer interne/vertrauliche Daten.
4. Eine Erkennung fuer Gremium, Toolbedarf und Spezialagenten-Ideen.
5. Einen klaren zentralen Einstieg fuer den Master-Agenten.

## Testseiten

- /cmt/master
- /cmt/master/status
- /cmt/master/entry
- /cmt/ask

## Safety

Alles bleibt dry-run-only:

- provider = none
- modelSelected = none
- dryRunOnly = true
- liveModelEnabled = false
- internetAccessEnabled = false
- networkCallAllowed = false
- providerDispatchAllowed = false
- externalSharingAllowed = false
- finalDispatchBlocked = true

## Status

Der Master-Agent ist jetzt lokal testbar als Router.

Er ist noch nicht live mit KI-Modell.

## Naechster Schritt

Weiter mit Phase 121.0: Datenschutz-Gate mit Freigabe- und Anonymisierungsentscheidung ausbauen.
`);

write('scripts/v120-3.cjs', `const fs = require('fs');

const checks = [
  ['README_PHASE120_3.md', 'Phase 120.3'],
  ['README_PHASE120_3.md', 'Master Agent Router MVP'],
  ['README_PHASE120_3.md', 'Master Agent Router Status'],
  ['README_PHASE120_3.md', 'Master Agent Entry'],
  ['README_PHASE120_3.md', 'privacy_gate'],
  ['README_PHASE120_3.md', 'agent_builder'],
  ['README_PHASE120_3.md', 'provider = none'],
  ['README_PHASE120_3.md', 'liveModelEnabled = false'],
  ['README_PHASE120_3.md', 'internetAccessEnabled = false'],
  ['README_PHASE120_3.md', 'externalSharingAllowed = false'],
  ['README_PHASE120_3.md', 'Phase 121.0'],
  ['frontend/lib/cmt-master.ts', 'askMasterAgentLocal'],
  ['frontend/lib/cmt-master-status.ts', 'getMasterAgentStatus'],
  ['frontend/lib/cmt-master-entry.ts', 'getMasterAgentEntry'],
  ['package.json', 'phase120:3:verify'],
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
console.log('Phase 120.3 Master Agent Router Handoff verification OK.');
`);

write('scripts/s120-3.cjs', `const http = require('http');

const urls = [
  ['Master UI', 'http://localhost:3000/cmt/master'],
  ['Master Status UI', 'http://localhost:3000/cmt/master/status'],
  ['Master Entry UI', 'http://localhost:3000/cmt/master/entry'],
  ['Master API', 'http://localhost:3000/api/cmt/master'],
  ['Master Status API', 'http://localhost:3000/api/cmt/master/status'],
  ['Master Entry API', 'http://localhost:3000/api/cmt/master/entry'],
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
pkg.scripts['phase120:3:verify'] = 'node scripts/v120-3.cjs';
pkg.scripts['phase120:3:smoke'] = 'node scripts/s120-3.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 120.3 Master Agent Router Handoff patch applied.');
