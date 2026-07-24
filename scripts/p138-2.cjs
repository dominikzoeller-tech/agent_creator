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

write('frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', `import { getSecureMasterAnswerLogJsonImportStatus, type SecureMasterAnswerLogJsonImportStatus } from './cmt-master-answer-log-list-json-import-status';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportEntry = {
  phase: '138.2';
  label: 'Secure Master Answer Log JSON Import Entry';
  status: SecureMasterAnswerLogJsonImportStatus;
  primaryImportPage: '/cmt/master/secure/main/log/list/import-json';
  importStatusPage: '/cmt/master/secure/main/log/list/import-json/status';
  exportPage: '/cmt/master/secure/main/log/list/export-json';
  exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status';
  mainLogListPage: '/cmt/master/secure/main/log/list';
  secureMasterPage: '/cmt/master/secure';
  importApi: '/api/cmt/master/secure/main/log/list/import-json';
  storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
  recommendedUse: string[];
  uiChecklist: string[];
  importState: {
    jsonImportEntryVisible: true;
    importPrepared: true;
    importUiVisible: true;
    schemaCheckPrepared: true;
    importPreviewPrepared: true;
    validationPrepared: true;
    applyImportAutomatically: false;
    manualApplyRequiredLater: true;
    browserStorePreserved: true;
    persistedInBrowser: 'browser_optional_local';
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

export function getSecureMasterAnswerLogJsonImportEntry(): SecureMasterAnswerLogJsonImportEntry {
  return {
    phase: '138.2',
    label: 'Secure Master Answer Log JSON Import Entry',
    status: getSecureMasterAnswerLogJsonImportStatus(),
    primaryImportPage: '/cmt/master/secure/main/log/list/import-json',
    importStatusPage: '/cmt/master/secure/main/log/list/import-json/status',
    exportPage: '/cmt/master/secure/main/log/list/export-json',
    exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status',
    mainLogListPage: '/cmt/master/secure/main/log/list',
    secureMasterPage: '/cmt/master/secure',
    importApi: '/api/cmt/master/secure/main/log/list/import-json',
    storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
    recommendedUse: [
      'JSON-Import-Seite als lokalen Import-Pruefpunkt fuer Answer-Log-Exporte nutzen.',
      'Export-JSON einfuegen und Import Preview vorbereiten.',
      'Schema-Pruefung und Validation kontrollieren.',
      'Import Preview pruefen, aber Import noch nicht anwenden.',
      'Statusseite zur Kontrolle der Import-Flags nutzen.',
      'Haupt-Logliste bleibt bevorzugter lokaler Loglisten-Testpunkt.',
      'Server-Persistenz weiterhin nicht erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    uiChecklist: [
      'JSON-Import-Entry sichtbar.',
      'JSON-Import-Seite verlinkt.',
      'JSON-Import-Status verlinkt.',
      'JSON-Export-Seite verlinkt.',
      'Haupt-Logliste verlinkt.',
      'Storage Key sichtbar.',
      'importPrepared = true sichtbar.',
      'importUiVisible = true sichtbar.',
      'schemaCheckPrepared = true sichtbar.',
      'importPreviewPrepared = true sichtbar.',
      'validationPrepared = true sichtbar.',
      'applyImportAutomatically = false sichtbar.',
      'manualApplyRequiredLater = true sichtbar.',
      'persistedOnServer = false sichtbar.',
      'externalSharingAllowed = false sichtbar.',
    ],
    importState: {
      jsonImportEntryVisible: true,
      importPrepared: true,
      importUiVisible: true,
      schemaCheckPrepared: true,
      importPreviewPrepared: true,
      validationPrepared: true,
      applyImportAutomatically: false,
      manualApplyRequiredLater: true,
      browserStorePreserved: true,
      persistedInBrowser: 'browser_optional_local',
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
    nextMilestone: 'Phase 138.3: Secure Master Answer Log JSON Import Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/import-json/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-import-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/import-json/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogJsonImportEntry } from '../../../../../../../../lib/cmt-master-answer-log-list-json-import-entry';

export default function SecureMasterAnswerLogJsonImportEntryPage() {
  const entry = getSecureMasterAnswerLogJsonImportEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 138.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> JSON-Import-Entry ist sichtbar. Import wird nur geprueft und angezeigt, nicht automatisch angewendet.</p>
        <p><strong>Storage Key:</strong> {entry.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryImportPage}>JSON-Import-Seite</Link></li>
          <li><Link href={entry.importStatusPage}>JSON-Import-Status</Link></li>
          <li><Link href={entry.exportPage}>JSON-Export-Seite</Link></li>
          <li><Link href={entry.exportStatusPage}>JSON-Export-Status</Link></li>
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
        <h3>Import State</h3>
        <ul>{Object.entries(entry.importState).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Validation</h3>
        <ul>{Object.entries(entry.status.importDemo.validation).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
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

write('README_PHASE138_2.md', `# Phase 138.2 - Secure Master Answer Log JSON Import Entry

Baut eine Entry-Seite fuer den lokalen JSON-Import der Haupt-Logliste.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-json-import-entry.ts
- API: /api/cmt/master/secure/main/log/list/import-json/entry
- UI: /cmt/master/secure/main/log/list/import-json/entry
- Patch: scripts/p138-2.cjs
- Verify: scripts/v138-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list/import-json
- /cmt/master/secure/main/log/list/import-json/status
- /cmt/master/secure/main/log/list/import-json/entry
- /cmt/master/secure/main/log/list/export-json
- /cmt/master/secure/main/log/list/export-json/status
- /cmt/master/secure/main/log/list
- /cmt/master/secure

Status:

- JSON-Import-Entry sichtbar
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
- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
`);

write('scripts/v138-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'getSecureMasterAnswerLogJsonImportEntry'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', "phase: '138.2'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'jsonImportEntryVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'importPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'importUiVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'schemaCheckPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'importPreviewPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'validationPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'manualApplyRequiredLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/entry/route.ts', 'getSecureMasterAnswerLogJsonImportEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/entry/page.tsx', 'Import State'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/entry/page.tsx', 'Demo Validation'],
  ['README_PHASE138_2.md', 'Secure Master Answer Log JSON Import Entry'],
  ['package.json', 'phase138:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 138.2 Secure Master Answer Log JSON Import Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase138:2:verify'] = 'node scripts/v138-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 138.2 Secure Master Answer Log JSON Import Entry patch applied.');
