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

write('frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', `import { getSecureMasterAnswerLogJsonImportApplyStatus, type SecureMasterAnswerLogJsonImportApplyStatus } from './cmt-master-answer-log-list-json-import-apply-status';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportApplyEntry = {
  phase: '139.2';
  label: 'Secure Master Answer Log JSON Import Manual Browser Apply Entry';
  status: SecureMasterAnswerLogJsonImportApplyStatus;
  primaryApplyPage: '/cmt/master/secure/main/log/list/import-json/apply';
  applyStatusPage: '/cmt/master/secure/main/log/list/import-json/apply/status';
  importPage: '/cmt/master/secure/main/log/list/import-json';
  importStatusPage: '/cmt/master/secure/main/log/list/import-json/status';
  exportPage: '/cmt/master/secure/main/log/list/export-json';
  mainLogListPage: '/cmt/master/secure/main/log/list';
  secureMasterPage: '/cmt/master/secure';
  applyApi: '/api/cmt/master/secure/main/log/list/import-json/apply';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  recommendedUse: string[];
  uiChecklist: string[];
  applyState: {
    jsonImportManualApplyEntryVisible: true;
    manualApplyPrepared: true;
    applyButtonVisible: true;
    applyRequiresValidSchema: true;
    applyRequiresParseOk: true;
    applyImportAutomatically: false;
    previewVisibleBeforeApply: true;
    validationVisibleBeforeApply: true;
    localStorageWritePrepared: true;
    browserStorePreserved: true;
    persistedInBrowser: 'browser_optional_local_after_manual_apply';
    persistedOnServer: false;
    serverStoragePrepared: false;
  };
  safety: {
    localTestable: true;
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    externalSharingAllowed: false;
    finalDispatchBlocked: true;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogJsonImportApplyEntry(): SecureMasterAnswerLogJsonImportApplyEntry {
  return {
    phase: '139.2',
    label: 'Secure Master Answer Log JSON Import Manual Browser Apply Entry',
    status: getSecureMasterAnswerLogJsonImportApplyStatus(),
    primaryApplyPage: '/cmt/master/secure/main/log/list/import-json/apply',
    applyStatusPage: '/cmt/master/secure/main/log/list/import-json/apply/status',
    importPage: '/cmt/master/secure/main/log/list/import-json',
    importStatusPage: '/cmt/master/secure/main/log/list/import-json/status',
    exportPage: '/cmt/master/secure/main/log/list/export-json',
    mainLogListPage: '/cmt/master/secure/main/log/list',
    secureMasterPage: '/cmt/master/secure',
    applyApi: '/api/cmt/master/secure/main/log/list/import-json/apply',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    recommendedUse: [
      'Manual-Apply-Seite als lokalen Uebernahmepunkt fuer validierte Export-JSON-Daten nutzen.',
      'Apply Preview vorbereiten und Validation kontrollieren.',
      'Nur bei parseOk=true und schemaOk=true manuell in Browser speichern.',
      'Vor dem Anwenden Preview und Validation sichtbar halten.',
      'Statusseite zur Kontrolle der Apply-Flags nutzen.',
      'Haupt-Logliste nach manueller Uebernahme separat pruefen.',
      'Keinen automatischen Import erwarten.',
      'Server-Persistenz weiterhin nicht erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'Manual-Apply-Entry sichtbar.',
      'Manual-Apply-Seite verlinkt.',
      'Manual-Apply-Status verlinkt.',
      'JSON-Import-Seite verlinkt.',
      'JSON-Export-Seite verlinkt.',
      'Haupt-Logliste verlinkt.',
      'Storage Key sichtbar.',
      'manualApplyPrepared = true sichtbar.',
      'applyButtonVisible = true sichtbar.',
      'applyRequiresValidSchema = true sichtbar.',
      'applyRequiresParseOk = true sichtbar.',
      'applyImportAutomatically = false sichtbar.',
      'previewVisibleBeforeApply = true sichtbar.',
      'validationVisibleBeforeApply = true sichtbar.',
      'localStorageWritePrepared = true sichtbar.',
      'persistedOnServer = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    applyState: {
      jsonImportManualApplyEntryVisible: true,
      manualApplyPrepared: true,
      applyButtonVisible: true,
      applyRequiresValidSchema: true,
      applyRequiresParseOk: true,
      applyImportAutomatically: false,
      previewVisibleBeforeApply: true,
      validationVisibleBeforeApply: true,
      localStorageWritePrepared: true,
      browserStorePreserved: true,
      persistedInBrowser: 'browser_optional_local_after_manual_apply',
      persistedOnServer: false,
      serverStoragePrepared: false,
    },
    safety: {
      localTestable: true,
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    nextMilestone: 'Phase 139.3: Secure Master Answer Log JSON Import Manual Browser Apply Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/import-json/apply/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportApplyEntry } from '../../../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportApplyEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/import-json/apply/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogJsonImportApplyEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply-entry';

export default function SecureMasterAnswerLogJsonImportApplyEntryPage() {
  const entry = getSecureMasterAnswerLogJsonImportApplyEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 139.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Manual-Apply-Entry ist sichtbar. Validierte Export-JSON-Daten koennen manuell in den Browser-Speicher uebernommen werden.</p>
        <p><strong>Storage Key:</strong> {entry.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryApplyPage}>Manual-Apply-Seite</Link></li>
          <li><Link href={entry.applyStatusPage}>Manual-Apply-Status</Link></li>
          <li><Link href={entry.importPage}>JSON-Import-Seite</Link></li>
          <li><Link href={entry.importStatusPage}>JSON-Import-Status</Link></li>
          <li><Link href={entry.exportPage}>JSON-Export-Seite</Link></li>
          <li><Link href={entry.mainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={entry.secureMasterPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Nutzung</h3>
        <ol>{entry.recommendedUse.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>UI-Checklist</h3>
        <ol>{entry.uiChecklist.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Apply State</h3>
        <ul>{Object.entries(entry.applyState).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Apply Payload Preview</h3>
        <ul>{Object.entries(entry.status.applyDemo.applyPayloadPreview).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Validation</h3>
        <ul>{Object.entries(entry.status.applyDemo.importPreview.validation).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(entry.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE139_2.md', `# Phase 139.2 - Secure Master Answer Log JSON Import Manual Browser Apply Entry

Baut eine Entry-Seite fuer die manuelle Uebernahme validierter Export-JSON-Daten in den Browser-Speicher.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts
- API: /api/cmt/master/secure/main/log/list/import-json/apply/entry
- UI: /cmt/master/secure/main/log/list/import-json/apply/entry
- Patch: scripts/p139-2.cjs
- Verify: scripts/v139-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list/import-json/apply
- /cmt/master/secure/main/log/list/import-json/apply/status
- /cmt/master/secure/main/log/list/import-json/apply/entry
- /cmt/master/secure/main/log/list/import-json
- /cmt/master/secure/main/log/list/import-json/status
- /cmt/master/secure/main/log/list/export-json
- /cmt/master/secure/main/log/list
- /cmt/master/secure

Status:

- Manual-Apply-Entry sichtbar
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
- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
`);

write('scripts/v139-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'getSecureMasterAnswerLogJsonImportApplyEntry'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', "phase: '139.2'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'jsonImportManualApplyEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'manualApplyPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'applyButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'applyRequiresValidSchema: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'applyRequiresParseOk: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'previewVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'validationVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'localStorageWritePrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/apply/entry/route.ts', 'getSecureMasterAnswerLogJsonImportApplyEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/entry/page.tsx', 'Apply State'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/entry/page.tsx', 'Demo Apply Payload Preview'],
  ['README_PHASE139_2.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Entry'],
  ['package.json', 'phase139:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 139.2 Secure Master Answer Log JSON Import Manual Browser Apply Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase139:2:verify'] = 'node scripts/v139-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 139.2 Secure Master Answer Log JSON Import Manual Browser Apply Entry patch applied.');
