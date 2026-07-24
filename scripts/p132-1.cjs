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

write('frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', `import { getSecureMasterAnswerLogListFilterOptionsDemo, type SecureMasterAnswerLogListFilterOptionsResult } from './cmt-master-answer-log-list-filter-options';

export type SecureMasterAnswerLogListFilterOptionsStatus = {
  phase: '132.1';
  label: 'Secure Master Local Answer Log List Filter Options Status';
  optionsPage: '/cmt/master/secure/main/log/list/filter/options';
  optionsApi: '/api/cmt/master/secure/main/log/list/filter/options';
  filterPage: '/cmt/master/secure/main/log/list/filter';
  listPage: '/cmt/master/secure/main/log/list';
  mainPage: '/cmt/master/secure';
  demo: SecureMasterAnswerLogListFilterOptionsResult;
  optionsState: {
    routeOptionsVisible: true;
    intentOptionsVisible: true;
    privacyOptionsVisible: true;
    allOptionPrepended: true;
    sourceCountVisible: true;
    usesInMemoryList: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    localOnly: true;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
    summary: string;
  };
  visibleFields: string[];
  testChecks: string[];
  nextMilestones: string[];
};

export function getSecureMasterAnswerLogListFilterOptionsStatus(): SecureMasterAnswerLogListFilterOptionsStatus {
  return {
    phase: '132.1',
    label: 'Secure Master Local Answer Log List Filter Options Status',
    optionsPage: '/cmt/master/secure/main/log/list/filter/options',
    optionsApi: '/api/cmt/master/secure/main/log/list/filter/options',
    filterPage: '/cmt/master/secure/main/log/list/filter',
    listPage: '/cmt/master/secure/main/log/list',
    mainPage: '/cmt/master/secure',
    demo: getSecureMasterAnswerLogListFilterOptionsDemo(),
    optionsState: {
      routeOptionsVisible: true,
      intentOptionsVisible: true,
      privacyOptionsVisible: true,
      allOptionPrepended: true,
      sourceCountVisible: true,
      usesInMemoryList: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      localOnly: true,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
      summary: 'Die lokale Optionsansicht fuer Filter-Dropdowns ist sichtbar. Routes, Intents und Privacy-Entscheidungen werden aus der In-Memory-Logliste abgeleitet. all wird immer vorangestellt. Es gibt weiterhin keine dauerhafte Speicherung.',
    },
    visibleFields: [
      'sourceCount',
      'routes',
      'intents',
      'privacyDecisions',
      'all option',
      'persistedInBrowser',
      'persistedOnServer',
      'externalSharingAllowed',
    ],
    testChecks: [
      'routes enthaelt all',
      'intents enthaelt all',
      'privacyDecisions enthaelt all',
      'sourceCount groesser 0',
      'persistedInBrowser = false',
      'persistedOnServer = false',
      'externalSharingAllowed = false',
    ],
    nextMilestones: [
      'Filter Options Entry ergaenzen',
      'Filter Options Handoff ergaenzen',
      'Dropdowns in bestehende Filterseite integrieren',
      'Persistenz weiterhin deaktiviert lassen',
    ],
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/filter/options/status/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterOptionsStatus } from '../../../../../../../../../../../lib/cmt-master-answer-log-list-filter-options-status';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterOptionsStatus());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/filter/options/status/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterOptionsStatus } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-options-status';

export default function SecureMasterAnswerLogListFilterOptionsStatusPage() {
  const status = getSecureMasterAnswerLogListFilterOptionsStatus();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 132.1</h1>
        <h2>{status.label}</h2>
        <p>{status.optionsState.summary}</p>
        <p><Link href={status.optionsPage}>Filter-Optionen öffnen</Link></p>
        <p><Link href={status.filterPage}>Filteransicht öffnen</Link></p>
        <p><Link href={status.listPage}>Logliste öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Options State</h3>
        <ul>
          <li>routeOptionsVisible: {String(status.optionsState.routeOptionsVisible)}</li>
          <li>intentOptionsVisible: {String(status.optionsState.intentOptionsVisible)}</li>
          <li>privacyOptionsVisible: {String(status.optionsState.privacyOptionsVisible)}</li>
          <li>allOptionPrepended: {String(status.optionsState.allOptionPrepended)}</li>
          <li>sourceCountVisible: {String(status.optionsState.sourceCountVisible)}</li>
          <li>usesInMemoryList: {String(status.optionsState.usesInMemoryList)}</li>
          <li>persistedInBrowser: {String(status.optionsState.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(status.optionsState.persistedOnServer)}</li>
          <li>localOnly: {String(status.optionsState.localOnly)}</li>
          <li>liveModelEnabled: {String(status.optionsState.liveModelEnabled)}</li>
          <li>providerEnabled: {String(status.optionsState.providerEnabled)}</li>
          <li>internetEnabled: {String(status.optionsState.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(status.optionsState.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Snapshot</h3>
        <ul>
          <li>sourceCount: {status.demo.sourceCount}</li>
          <li>routeOptions: {status.demo.routes.length}</li>
          <li>intentOptions: {status.demo.intents.length}</li>
          <li>privacyOptions: {status.demo.privacyDecisions.length}</li>
          <li>firstRouteOption: {status.demo.routes[0]}</li>
          <li>firstIntentOption: {status.demo.intents[0]}</li>
          <li>firstPrivacyOption: {status.demo.privacyDecisions[0]}</li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Felder</h3>
        <ul>{status.visibleFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Testchecks</h3>
        <ol>{status.testChecks.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Naechste Meilensteine</h3>
        <ol>{status.nextMilestones.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>
    </main>
  );
}
`);

write('README_PHASE132_1.md', `# Phase 132.1 - Secure Master Local Answer Log List Filter Options Status

Baut eine Statusseite fuer die lokal abgeleiteten Filter-Dropdown-Optionen.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-filter-options-status.ts
- API: /api/cmt/master/secure/main/log/list/filter/options/status
- UI: /cmt/master/secure/main/log/list/filter/options/status
- Patch: scripts/p132-1.cjs
- Verify: scripts/v132-1.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list/filter/options
- /cmt/master/secure/main/log/list/filter/options/status
- /cmt/master/secure/main/log/list/filter
- /cmt/master/secure/main/log/list
- /cmt/master/secure

Status:

- lokal testbar
- Route-Optionen sichtbar
- Intent-Optionen sichtbar
- Privacy-Optionen sichtbar
- all wird vorangestellt
- sourceCount sichtbar
- persistedInBrowser = false
- persistedOnServer = false
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v132-1.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'getSecureMasterAnswerLogListFilterOptionsStatus'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', "phase: '132.1'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', "optionsPage: '/cmt/master/secure/main/log/list/filter/options'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'routeOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'intentOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'privacyOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'allOptionPrepended: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-status.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/options/status/route.ts', 'getSecureMasterAnswerLogListFilterOptionsStatus'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/options/status/page.tsx', 'Options State'],
  ['README_PHASE132_1.md', 'Secure Master Local Answer Log List Filter Options Status'],
  ['package.json', 'phase132:1:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 132.1 Secure Master Local Answer Log List Filter Options Status verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase132:1:verify'] = 'node scripts/v132-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 132.1 Secure Master Local Answer Log List Filter Options Status patch applied.');
