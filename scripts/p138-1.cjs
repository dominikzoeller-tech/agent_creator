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

write('frontend/lib/cmt-master-answer-log-list-json-import-status.ts', `import { getSecureMasterAnswerLogJsonImportDemo, type SecureMasterAnswerLogJsonImportResult } from './cmt-master-answer-log-list-json-import';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportStatus = {
  phase: '138.1';
  label: 'Secure Master Answer Log JSON Import Status';
  importDemo: SecureMasterAnswerLogJsonImportResult;
  pages: {
    importPage: '/cmt/master/secure/main/log/list/import-json';
    exportPage: '/cmt/master/secure/main/log/list/export-json';
    exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status';
    mainLogListPage: '/cmt/master/secure/main/log/list';
    secureMasterPage: '/cmt/master/secure';
  };
  importStatus: {
    storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
    localTestable: true;
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
    localOnly: true;
    providerEnabled: false;
    internetEnabled: false;
    liveModelEnabled: false;
    networkCallAllowed: false;
    externalSharingAllowed: false;
    finalDispatchBlocked: true;
  };
  checks: string[];
  nextMilestone: string;
};

export function getSecureMasterAnswerLogJsonImportStatus(): SecureMasterAnswerLogJsonImportStatus {
  return {
    phase: '138.1',
    label: 'Secure Master Answer Log JSON Import Status',
    importDemo: getSecureMasterAnswerLogJsonImportDemo(),
    pages: {
      importPage: '/cmt/master/secure/main/log/list/import-json',
      exportPage: '/cmt/master/secure/main/log/list/export-json',
      exportStatusPage: '/cmt/master/secure/main/log/list/export-json/status',
      mainLogListPage: '/cmt/master/secure/main/log/list',
      secureMasterPage: '/cmt/master/secure',
    },
    importStatus: {
      storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
      localTestable: true,
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
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    checks: [
      'JSON-Import-Seite ist erreichbar.',
      'Import-UI ist sichtbar.',
      'Schema-Pruefung ist vorbereitet.',
      'Validation ist vorbereitet.',
      'Import Preview ist vorbereitet.',
      'Import wird nicht automatisch angewendet.',
      'Manuelle Anwendung ist fuer spaeter vorbereitet.',
      'Browser-Speicher bleibt erhalten.',
      'persistedInBrowser = browser_optional_local.',
      'persistedOnServer = false.',
      'serverStoragePrepared = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 138.2: Secure Master Answer Log JSON Import Entry',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/import-json/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-import-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/import-json/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogJsonImportStatus } from '../../../../../../../../lib/cmt-master-answer-log-list-json-import-status';

export default function SecureMasterAnswerLogJsonImportStatusPage() {
  const data = getSecureMasterAnswerLogJsonImportStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 138.1</h1>
        <h2>{data.label}</h2>
        <p><strong>Status:</strong> JSON-Import-Status ist sichtbar. Import wird geprueft und angezeigt, aber nicht automatisch angewendet.</p>
        <p><strong>Storage Key:</strong> {data.importStatus.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Links</h3>
        <ul>
          <li><Link href={data.pages.importPage}>JSON-Import-Seite</Link></li>
          <li><Link href={data.pages.exportPage}>JSON-Export-Seite</Link></li>
          <li><Link href={data.pages.exportStatusPage}>JSON-Export-Status</Link></li>
          <li><Link href={data.pages.mainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={data.pages.secureMasterPage}>Secure Master</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Import Status</h3>
        <ul>{Object.entries(data.importStatus).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Validation</h3>
        <ul>{Object.entries(data.importDemo.validation).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>{Object.entries(data.safety).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Checks</h3>
        <ol>{data.checks.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {data.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE138_1.md', `# Phase 138.1 - Secure Master Answer Log JSON Import Status

Baut eine Statusseite fuer den lokalen JSON-Import der Haupt-Logliste.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-json-import-status.ts
- API: /api/cmt/master/secure/main/log/list/import-json/status
- UI: /cmt/master/secure/main/log/list/import-json/status
- Patch: scripts/p138-1.cjs
- Verify: scripts/v138-1.cjs

Status:

- JSON-Import-Status sichtbar
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

write('scripts/v138-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'getSecureMasterAnswerLogJsonImportStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', "phase: '138.1'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'importPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'importUiVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'schemaCheckPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'importPreviewPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'validationPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'manualApplyRequiredLater: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'browserStorePreserved: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/status/route.ts', 'getSecureMasterAnswerLogJsonImportStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/status/page.tsx', 'Import Status'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/status/page.tsx', 'Demo Validation'],
  ['README_PHASE138_1.md', 'Secure Master Answer Log JSON Import Status'],
  ['package.json', 'phase138:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 138.1 Secure Master Answer Log JSON Import Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase138:1:verify'] = 'node scripts/v138-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 138.1 Secure Master Answer Log JSON Import Status patch applied.');
