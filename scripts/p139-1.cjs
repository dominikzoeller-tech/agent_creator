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

write('frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', `import { getSecureMasterAnswerLogJsonImportApplyDemo, type SecureMasterAnswerLogJsonImportApplyResult } from './cmt-master-answer-log-list-json-import-apply';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogJsonImportApplyStatus = {
  phase: '139.1';
  label: 'Secure Master Answer Log JSON Import Manual Browser Apply Status';
  applyDemo: SecureMasterAnswerLogJsonImportApplyResult;
  pages: {
    applyPage: '/cmt/master/secure/main/log/list/import-json/apply';
    importPage: '/cmt/master/secure/main/log/list/import-json';
    importStatusPage: '/cmt/master/secure/main/log/list/import-json/status';
    exportPage: '/cmt/master/secure/main/log/list/export-json';
    mainLogListPage: '/cmt/master/secure/main/log/list';
    secureMasterPage: '/cmt/master/secure';
  };
  applyStatus: {
    storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
    localTestable: true;
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

export function getSecureMasterAnswerLogJsonImportApplyStatus(): SecureMasterAnswerLogJsonImportApplyStatus {
  return {
    phase: '139.1',
    label: 'Secure Master Answer Log JSON Import Manual Browser Apply Status',
    applyDemo: getSecureMasterAnswerLogJsonImportApplyDemo(),
    pages: {
      applyPage: '/cmt/master/secure/main/log/list/import-json/apply',
      importPage: '/cmt/master/secure/main/log/list/import-json',
      importStatusPage: '/cmt/master/secure/main/log/list/import-json/status',
      exportPage: '/cmt/master/secure/main/log/list/export-json',
      mainLogListPage: '/cmt/master/secure/main/log/list',
      secureMasterPage: '/cmt/master/secure',
    },
    applyStatus: {
      storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
      localTestable: true,
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
      localOnly: true,
      providerEnabled: false,
      internetEnabled: false,
      liveModelEnabled: false,
      networkCallAllowed: false,
      externalSharingAllowed: false,
      finalDispatchBlocked: true,
    },
    checks: [
      'Manual-Apply-Seite ist erreichbar.',
      'Apply-Button ist sichtbar.',
      'Apply Preview ist vorbereitet.',
      'Validation vor Apply ist sichtbar.',
      'Import Preview vor Apply ist sichtbar.',
      'Apply erfordert parsebares JSON.',
      'Apply erfordert gueltiges Export-Schema.',
      'Kein automatischer Import.',
      'localStorage-Write ist vorbereitet.',
      'Browser-Speicher bleibt lokal.',
      'persistedOnServer = false.',
      'serverStoragePrepared = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 139.2: Secure Master Answer Log JSON Import Manual Browser Apply Entry',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/import-json/apply/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogJsonImportApplyStatus } from '../../../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogJsonImportApplyStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/import-json/apply/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogJsonImportApplyStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply-status';

export default function SecureMasterAnswerLogJsonImportApplyStatusPage() {
  const data = getSecureMasterAnswerLogJsonImportApplyStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 139.1</h1>
        <h2>{data.label}</h2>
        <p><strong>Status:</strong> Manual-Apply-Status ist sichtbar. Apply bleibt manuell, lokal und schema-validiert.</p>
        <p><strong>Storage Key:</strong> {data.applyStatus.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Links</h3>
        <ul>
          <li><Link href={data.pages.applyPage}>Manual-Apply-Seite</Link></li>
          <li><Link href={data.pages.importPage}>JSON-Import-Seite</Link></li>
          <li><Link href={data.pages.importStatusPage}>JSON-Import-Status</Link></li>
          <li><Link href={data.pages.exportPage}>JSON-Export-Seite</Link></li>
          <li><Link href={data.pages.mainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={data.pages.secureMasterPage}>Secure Master</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Apply Status</h3>
        <ul>{Object.entries(data.applyStatus).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Apply Payload Preview</h3>
        <ul>{Object.entries(data.applyDemo.applyPayloadPreview).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Validation</h3>
        <ul>{Object.entries(data.applyDemo.importPreview.validation).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
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

write('README_PHASE139_1.md', `# Phase 139.1 - Secure Master Answer Log JSON Import Manual Browser Apply Status

Baut eine Statusseite fuer die manuelle Uebernahme validierter Export-JSON-Daten in den Browser-Speicher.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts
- API: /api/cmt/master/secure/main/log/list/import-json/apply/status
- UI: /cmt/master/secure/main/log/list/import-json/apply/status
- Patch: scripts/p139-1.cjs
- Verify: scripts/v139-1.cjs

Status:

- Manual-Apply-Status sichtbar
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

write('scripts/v139-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'getSecureMasterAnswerLogJsonImportApplyStatus'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', "phase: '139.1'"],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'manualApplyPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'applyButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'applyRequiresValidSchema: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'applyRequiresParseOk: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'previewVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'validationVisibleBeforeApply: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'localStorageWritePrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-json-import-apply-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/import-json/apply/status/route.ts', 'getSecureMasterAnswerLogJsonImportApplyStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/status/page.tsx', 'Apply Status'],
  ['frontend/app/cmt/master/secure/main/log/list/import-json/apply/status/page.tsx', 'Demo Apply Payload Preview'],
  ['README_PHASE139_1.md', 'Secure Master Answer Log JSON Import Manual Browser Apply Status'],
  ['package.json', 'phase139:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 139.1 Secure Master Answer Log JSON Import Manual Browser Apply Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase139:1:verify'] = 'node scripts/v139-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 139.1 Secure Master Answer Log JSON Import Manual Browser Apply Status patch applied.');
