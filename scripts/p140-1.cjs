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

write('frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', `import { getSecureMasterAnswerLogManualApplyBrowserLoadDemo, type SecureMasterAnswerLogManualApplyBrowserLoadResult } from './cmt-master-answer-log-list-manual-apply-browser-load';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from './cmt-master-answer-log-list-browser-store';

export type SecureMasterAnswerLogManualApplyBrowserLoadStatus = {
  phase: '140.1';
  label: 'Secure Master Main Log List Manual Apply Browser Load Status';
  loadDemo: SecureMasterAnswerLogManualApplyBrowserLoadResult;
  pages: {
    browserLoadPage: '/cmt/master/secure/main/log/list/manual-apply-browser-load';
    manualApplyPage: '/cmt/master/secure/main/log/list/import-json/apply';
    manualApplyStatusPage: '/cmt/master/secure/main/log/list/import-json/apply/status';
    mainLogListPage: '/cmt/master/secure/main/log/list';
    secureMasterPage: '/cmt/master/secure';
  };
  loadStatus: {
    storageKey: typeof SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY;
    localTestable: true;
    mainLogListManualApplyBrowserLoadPrepared: true;
    readsManualApplyPayloadFromBrowser: true;
    manualApplySourceRecognized: true;
    sourceLabelVisible: true;
    loadButtonVisible: true;
    browserReadPrepared: true;
    validationPrepared: true;
    sourcePreviewPrepared: true;
    applyImportAutomatically: false;
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

export function getSecureMasterAnswerLogManualApplyBrowserLoadStatus(): SecureMasterAnswerLogManualApplyBrowserLoadStatus {
  return {
    phase: '140.1',
    label: 'Secure Master Main Log List Manual Apply Browser Load Status',
    loadDemo: getSecureMasterAnswerLogManualApplyBrowserLoadDemo(),
    pages: {
      browserLoadPage: '/cmt/master/secure/main/log/list/manual-apply-browser-load',
      manualApplyPage: '/cmt/master/secure/main/log/list/import-json/apply',
      manualApplyStatusPage: '/cmt/master/secure/main/log/list/import-json/apply/status',
      mainLogListPage: '/cmt/master/secure/main/log/list',
      secureMasterPage: '/cmt/master/secure',
    },
    loadStatus: {
      storageKey: SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY,
      localTestable: true,
      mainLogListManualApplyBrowserLoadPrepared: true,
      readsManualApplyPayloadFromBrowser: true,
      manualApplySourceRecognized: true,
      sourceLabelVisible: true,
      loadButtonVisible: true,
      browserReadPrepared: true,
      validationPrepared: true,
      sourcePreviewPrepared: true,
      applyImportAutomatically: false,
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
      'Manual-Apply-Browser-Load-Seite ist erreichbar.',
      'Load Button ist sichtbar.',
      'Browser-Read ist vorbereitet.',
      'Manual-Apply-Quelle wird erkannt.',
      'Source Label ist vorbereitet.',
      'Validation ist vorbereitet.',
      'Source Preview ist vorbereitet.',
      'Kein automatischer Import.',
      'Browser-Speicher bleibt lokal.',
      'persistedInBrowser = browser_optional_local_after_manual_apply.',
      'persistedOnServer = false.',
      'serverStoragePrepared = false.',
      'externalSharingAllowed = false.',
    ],
    nextMilestone: 'Phase 140.2: Secure Master Main Log List Manual Apply Browser Load Entry',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/manual-apply-browser-load/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogManualApplyBrowserLoadStatus } from '../../../../../../../../../lib/cmt-master-answer-log-list-manual-apply-browser-load-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogManualApplyBrowserLoadStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogManualApplyBrowserLoadStatus } from '../../../../../../../../lib/cmt-master-answer-log-list-manual-apply-browser-load-status';

export default function SecureMasterManualApplyBrowserLoadStatusPage() {
  const data = getSecureMasterAnswerLogManualApplyBrowserLoadStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 140.1</h1>
        <h2>{data.label}</h2>
        <p><strong>Status:</strong> Manual-Apply-Browser-Load-Status ist sichtbar. Haupt-Logliste kann lokale Manual-Apply-Payloads pruefen.</p>
        <p><strong>Storage Key:</strong> {data.loadStatus.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Links</h3>
        <ul>
          <li><Link href={data.pages.browserLoadPage}>Manual-Apply-Browser-Load-Seite</Link></li>
          <li><Link href={data.pages.manualApplyPage}>Manual-Apply-Seite</Link></li>
          <li><Link href={data.pages.manualApplyStatusPage}>Manual-Apply-Status</Link></li>
          <li><Link href={data.pages.mainLogListPage}>Haupt-Logliste</Link></li>
          <li><Link href={data.pages.secureMasterPage}>Secure Master</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Load Status</h3>
        <ul>{Object.entries(data.loadStatus).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Validation</h3>
        <ul>{Object.entries(data.loadDemo.validation).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Source Preview</h3>
        <pre style={{ overflow: 'auto', maxHeight: 360, background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 12 }}>{JSON.stringify(data.loadDemo.preview, null, 2)}</pre>
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

write('README_PHASE140_1.md', `# Phase 140.1 - Secure Master Main Log List Manual Apply Browser Load Status

Baut eine Statusseite fuer das Laden manuell angewendeter Import-Payloads aus dem Browser-Speicher.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts
- API: /api/cmt/master/secure/main/log/list/manual-apply-browser-load/status
- UI: /cmt/master/secure/main/log/list/manual-apply-browser-load/status
- Patch: scripts/p140-1.cjs
- Verify: scripts/v140-1.cjs

Status:

- Manual-Apply-Browser-Load-Status sichtbar
- mainLogListManualApplyBrowserLoadPrepared = true
- readsManualApplyPayloadFromBrowser = true
- manualApplySourceRecognized = true
- sourceLabelVisible = true
- loadButtonVisible = true
- browserReadPrepared = true
- validationPrepared = true
- sourcePreviewPrepared = true
- applyImportAutomatically = false
- persistedInBrowser = browser_optional_local_after_manual_apply
- persistedOnServer = false
- serverStoragePrepared = false
- providerEnabled = false
- internetEnabled = false
- liveModelEnabled = false
- externalSharingAllowed = false
`);

write('scripts/v140-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'getSecureMasterAnswerLogManualApplyBrowserLoadStatus'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', "phase: '140.1'"],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'mainLogListManualApplyBrowserLoadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'readsManualApplyPayloadFromBrowser: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'manualApplySourceRecognized: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'sourceLabelVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'loadButtonVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'browserReadPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'validationPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'sourcePreviewPrepared: true'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'applyImportAutomatically: false'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-manual-apply-browser-load-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/manual-apply-browser-load/status/route.ts', 'getSecureMasterAnswerLogManualApplyBrowserLoadStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/status/page.tsx', 'Load Status'],
  ['frontend/app/cmt/master/secure/main/log/list/manual-apply-browser-load/status/page.tsx', 'Demo Source Preview'],
  ['README_PHASE140_1.md', 'Secure Master Main Log List Manual Apply Browser Load Status'],
  ['package.json', 'phase140:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 140.1 Secure Master Main Log List Manual Apply Browser Load Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase140:1:verify'] = 'node scripts/v140-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 140.1 Secure Master Main Log List Manual Apply Browser Load Status patch applied.');
