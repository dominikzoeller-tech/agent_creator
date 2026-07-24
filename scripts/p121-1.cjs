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

write('frontend/lib/cmt-privacy-status.ts', `import { getPrivacyGateDemo, type PrivacyGateResult } from './cmt-privacy-gate';

export type PrivacyGateStatus = {
  phase: '121.1';
  label: 'Privacy Gate Status';
  demo: PrivacyGateResult;
  status: {
    currentMode: 'privacy-gate-local-testable';
    mainPage: '/cmt/privacy';
    apiRoute: '/api/cmt/privacy';
    detectsInternalData: true;
    detectsPersonalData: true;
    detectsBusinessData: true;
    detectsSecretData: true;
    anonymizedPreviewEnabled: true;
    userApprovalPrepared: true;
    externalSharingAllowed: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    summary: string;
  };
  allowedOptions: string[];
  testInputs: string[];
  nextMilestones: string[];
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function getPrivacyGateStatus(): PrivacyGateStatus {
  const demo = getPrivacyGateDemo();
  return {
    phase: '121.1',
    label: 'Privacy Gate Status',
    demo,
    status: {
      currentMode: 'privacy-gate-local-testable',
      mainPage: '/cmt/privacy',
      apiRoute: '/api/cmt/privacy',
      detectsInternalData: true,
      detectsPersonalData: true,
      detectsBusinessData: true,
      detectsSecretData: true,
      anonymizedPreviewEnabled: true,
      userApprovalPrepared: true,
      externalSharingAllowed: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      summary: 'Das Privacy Gate ist lokal testbar. Es erkennt sensible Daten, erstellt eine anonymisierte Vorschau und blockiert externe Weitergabe.',
    },
    allowedOptions: ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'],
    testInputs: [
      'Erklaere mir allgemein, was der Master-Agent kann.',
      'Hier ist eine interne Kalkulation fuer Kunde Muster.',
      'Bitte pruefe Angebot 123 mit Marge und Kosten.',
      'Kontakt: test@example.com und Telefon 01234 567890.',
      'Das ist vertraulich und enthaelt ein API Key Secret.',
    ],
    nextMilestones: [
      'Privacy Gate in Master-Agent-Seite sichtbar integrieren',
      'Freigabeoptionen als UI-Auswahl vorbereiten',
      'Anonymisierung robuster machen',
      'Provider-Readiness erst nach Privacy-Gate-Stabilisierung vorbereiten',
    ],
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}
`);

write('frontend/app/api/cmt/privacy/status/route.ts', `import { NextResponse } from 'next/server';
import { getPrivacyGateStatus } from '../../../../../lib/cmt-privacy-status';

export async function GET() {
  return NextResponse.json(getPrivacyGateStatus());
}
`);

write('frontend/app/cmt/privacy/status/page.tsx', `import Link from 'next/link';
import { getPrivacyGateStatus } from '../../../../lib/cmt-privacy-status';

export default function PrivacyGateStatusPage() {
  const status = getPrivacyGateStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 121.1</h1>
        <h2>{status.label}</h2>
        <p>{status.status.summary}</p>
        <p><Link href={status.status.mainPage}>Privacy Gate öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Aktueller Status</h3>
        <ul>
          <li>currentMode: {status.status.currentMode}</li>
          <li>mainPage: {status.status.mainPage}</li>
          <li>apiRoute: {status.status.apiRoute}</li>
          <li>detectsInternalData: {String(status.status.detectsInternalData)}</li>
          <li>detectsPersonalData: {String(status.status.detectsPersonalData)}</li>
          <li>detectsBusinessData: {String(status.status.detectsBusinessData)}</li>
          <li>detectsSecretData: {String(status.status.detectsSecretData)}</li>
          <li>anonymizedPreviewEnabled: {String(status.status.anonymizedPreviewEnabled)}</li>
          <li>userApprovalPrepared: {String(status.status.userApprovalPrepared)}</li>
          <li>externalSharingAllowed: {String(status.status.externalSharingAllowed)}</li>
          <li>liveModelEnabled: {String(status.status.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.status.providerEnabled)}</li>
          <li>internetEnabled: {String(status.status.internetEnabled)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Freigabeoptionen vorbereitet</h3>
        <ul>{status.allowedOptions.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testeingaben</h3>
        <ol>{status.testInputs.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <p><strong>Decision:</strong> {status.demo.decision.decision}</p>
        <p><strong>Sensitivity:</strong> {status.demo.detected.sensitivity}</p>
        <p><strong>External Sharing:</strong> {String(status.demo.externalSharingAllowed)}</p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {status.provider}</li>
          <li>modelSelected: {status.modelSelected}</li>
          <li>dryRunOnly: {String(status.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(status.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(status.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(status.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE121_1.md', `# Phase 121.1 - Privacy Gate Status

Baut eine Statusseite fuer das lokale Privacy Gate.

Kurz-Namen:

- Store: frontend/lib/cmt-privacy-status.ts
- API: /api/cmt/privacy/status
- UI: /cmt/privacy/status
- Patch: scripts/p121-1.cjs
- Verify: scripts/v121-1.cjs

Funktion:

- Privacy-Gate-Status anzeigen
- erkannte Datenklassen anzeigen
- Freigabeoptionen anzeigen
- Testeingaben anzeigen
- naechste Meilensteine anzeigen

Status:

- privacy-gate-local-testable
- externalSharingAllowed = false
- kein Provider
- kein Internet
- kein Live-Modell
`);

write('scripts/v121-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-privacy-status.ts', 'getPrivacyGateStatus'],
  ['frontend/lib/cmt-privacy-status.ts', "phase: '121.1'"],
  ['frontend/lib/cmt-privacy-status.ts', "label: 'Privacy Gate Status'"],
  ['frontend/lib/cmt-privacy-status.ts', "currentMode: 'privacy-gate-local-testable'"],
  ['frontend/lib/cmt-privacy-status.ts', "mainPage: '/cmt/privacy'"],
  ['frontend/lib/cmt-privacy-status.ts', "apiRoute: '/api/cmt/privacy'"],
  ['frontend/lib/cmt-privacy-status.ts', 'detectsInternalData: true'],
  ['frontend/lib/cmt-privacy-status.ts', 'anonymizedPreviewEnabled: true'],
  ['frontend/lib/cmt-privacy-status.ts', 'externalSharingAllowed: false'],
  ['frontend/lib/cmt-privacy-status.ts', 'liveModelEnabled: false'],
  ['frontend/app/api/cmt/privacy/status/route.ts', 'getPrivacyGateStatus'],
  ['frontend/app/cmt/privacy/status/page.tsx', 'Phase 121.1'],
  ['frontend/app/cmt/privacy/status/page.tsx', 'Freigabeoptionen vorbereitet'],
  ['README_PHASE121_1.md', 'Privacy Gate Status'],
  ['package.json', 'phase121:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 121.1 Privacy Gate Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase121:1:verify'] = 'node scripts/v121-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 121.1 Privacy Gate Status patch applied.');
