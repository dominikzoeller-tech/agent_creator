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

write('frontend/lib/cmt-master-secure-guide.ts', `import { getSecureMasterStatus, type SecureMasterStatus } from './cmt-master-secure-status';

export type SecureMasterGuide = {
  phase: '122.2';
  label: 'Secure Master Agent Guide';
  status: SecureMasterStatus;
  openNow: string;
  quickTestSteps: string[];
  expectedBehaviors: string[];
  notYetLive: string[];
  nextBuildSteps: string[];
  safety: {
    provider: 'none';
    modelSelected: 'none';
    dryRunOnly: true;
    externalSharingAllowed: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    providerDispatchAllowed: false;
    finalDispatchBlocked: true;
  };
};

export function getSecureMasterGuide(): SecureMasterGuide {
  return {
    phase: '122.2',
    label: 'Secure Master Agent Guide',
    status: getSecureMasterStatus(),
    openNow: '/cmt/master/secure',
    quickTestSteps: [
      'Frontend starten oder laufenden Frontend-Server verwenden.',
      'http://localhost:3001/cmt/master/secure im Browser oeffnen.',
      'Eine allgemeine Frage stellen.',
      'Eine interne oder geschaeftliche Eingabe testen.',
      'Eine Entscheidungsfrage testen, bei der das Gremium sinnvoll waere.',
      'Eine Tool-Frage testen, zum Beispiel Wetter oder aktuelle Daten.',
      'Eine Spezialagenten-Frage testen, zum Beispiel Trading-Agent oder Immobilien-Agent.',
    ],
    expectedBehaviors: [
      'Unkritische Fragen werden lokal direkt geroutet.',
      'Interne oder sensible Daten werden auf privacy_gate geroutet.',
      'Entscheidungsfragen werden lokal Richtung Gremium geroutet.',
      'Aktuelle Daten werden als tool_required markiert.',
      'Agentenbau-Fragen werden als agent_builder markiert.',
      'Externe Weitergabe bleibt immer blockiert.',
      'Provider, Internet und Live-Modell bleiben deaktiviert.',
    ],
    notYetLive: [
      'Noch keine echten KI-Modell-Antworten.',
      'Noch kein Internetzugriff.',
      'Noch keine echte externe Provider-Weitergabe.',
      'Noch keine echte Desktop-Beobachtung.',
      'Noch keine produktive Spezialagenten-Erzeugung.',
    ],
    nextBuildSteps: [
      'Secure Master Agent als sichtbaren Haupt-Einstieg verlinken.',
      'Lokale Antwortqualitaet verbessern.',
      'Gremium-Antworten in Secure Master direkt anzeigen.',
      'Provider-Readiness vorbereiten, aber weiter blockiert halten.',
    ],
    safety: {
      provider: 'none',
      modelSelected: 'none',
      dryRunOnly: true,
      externalSharingAllowed: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      providerDispatchAllowed: false,
      finalDispatchBlocked: true,
    },
  };
}
`);

write('frontend/app/api/cmt/master/secure/guide/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterGuide } from '../../../../../../lib/cmt-master-secure-guide';

export async function GET() {
  return NextResponse.json(getSecureMasterGuide());
}
`);

write('frontend/app/cmt/master/secure/guide/page.tsx', `import Link from 'next/link';
import { getSecureMasterGuide } from '../../../../../lib/cmt-master-secure-guide';

export default function SecureMasterGuidePage() {
  const guide = getSecureMasterGuide();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 122.2</h1>
        <h2>{guide.label}</h2>
        <p><strong>Jetzt lokal testen:</strong> <Link href={guide.openNow}>{guide.openNow}</Link></p>
        <p><strong>Status:</strong> Secure Master Agent lokal testbar, noch nicht live mit KI-Modell.</p>
      </section>
      <section style={card}>
        <h3>Schnelltest</h3>
        <ol>{guide.quickTestSteps.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Erwartetes Verhalten</h3>
        <ul>{guide.expectedBehaviors.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Noch nicht live</h3>
        <ul>{guide.notYetLive.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Bauschritte</h3>
        <ol>{guide.nextBuildSteps.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety</h3>
        <ul>{Object.entries(guide.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE122_2.md', `# Phase 122.2 - Secure Master Agent Guide

Baut eine kurze Test- und Nutzungsanleitung fuer den Secure Master Agent.

Kurz-Namen:

- Store: frontend/lib/cmt-master-secure-guide.ts
- API: /api/cmt/master/secure/guide
- UI: /cmt/master/secure/guide
- Patch: scripts/p122-2.cjs
- Verify: scripts/v122-2.cjs

Wichtig:

Der lokale Testpunkt ist:

- /cmt/master/secure

Der Agent ist noch nicht live mit KI-Modell.

Status:

- secure-master-local-testable
- Master Router integriert
- Privacy Gate integriert
- externe Weitergabe blockiert
- kein Provider
- kein Internet
- kein Live-Modell
`);

write('scripts/v122-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-secure-guide.ts', 'getSecureMasterGuide'],
  ['frontend/lib/cmt-master-secure-guide.ts', "phase: '122.2'"],
  ['frontend/lib/cmt-master-secure-guide.ts', "openNow: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-secure-guide.ts', 'Noch keine echten KI-Modell-Antworten.'],
  ['frontend/lib/cmt-master-secure-guide.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/guide/route.ts', 'getSecureMasterGuide'],
  ['frontend/app/cmt/master/secure/guide/page.tsx', 'Schnelltest'],
  ['frontend/app/cmt/master/secure/guide/page.tsx', 'Noch nicht live'],
  ['README_PHASE122_2.md', 'Secure Master Agent Guide'],
  ['package.json', 'phase122:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 122.2 Secure Master Agent Guide verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase122:2:verify'] = 'node scripts/v122-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 122.2 Secure Master Agent Guide patch applied.');
