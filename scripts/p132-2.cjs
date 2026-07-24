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

write('frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', `import { getSecureMasterAnswerLogListFilterOptionsStatus, type SecureMasterAnswerLogListFilterOptionsStatus } from './cmt-master-answer-log-list-filter-options-status';

export type SecureMasterAnswerLogListFilterOptionsEntry = {
  phase: '132.2';
  label: 'Secure Master Local Answer Log List Filter Options Entry';
  status: SecureMasterAnswerLogListFilterOptionsStatus;
  primaryOptionsPage: '/cmt/master/secure/main/log/list/filter/options';
  optionsStatusPage: '/cmt/master/secure/main/log/list/filter/options/status';
  filterPage: '/cmt/master/secure/main/log/list/filter';
  listPage: '/cmt/master/secure/main/log/list';
  mainPage: '/cmt/master/secure';
  optionsApi: '/api/cmt/master/secure/main/log/list/filter/options';
  recommendedUse: string[];
  sampleChecks: string[];
  visibleOptionFields: string[];
  safety: {
    localTestable: true;
    routeOptionsVisible: true;
    intentOptionsVisible: true;
    privacyOptionsVisible: true;
    allOptionPrepended: true;
    persistedInBrowser: false;
    persistedOnServer: false;
    liveModelEnabled: false;
    providerEnabled: false;
    internetEnabled: false;
    externalSharingAllowed: false;
  };
  nextMilestone: string;
};

export function getSecureMasterAnswerLogListFilterOptionsEntry(): SecureMasterAnswerLogListFilterOptionsEntry {
  return {
    phase: '132.2',
    label: 'Secure Master Local Answer Log List Filter Options Entry',
    status: getSecureMasterAnswerLogListFilterOptionsStatus(),
    primaryOptionsPage: '/cmt/master/secure/main/log/list/filter/options',
    optionsStatusPage: '/cmt/master/secure/main/log/list/filter/options/status',
    filterPage: '/cmt/master/secure/main/log/list/filter',
    listPage: '/cmt/master/secure/main/log/list',
    mainPage: '/cmt/master/secure',
    optionsApi: '/api/cmt/master/secure/main/log/list/filter/options',
    recommendedUse: [
      'Options-Seite nutzen, um lokale Dropdown-Werte aus Logs abzuleiten.',
      'Statusseite zur Kontrolle von allOptionPrepended und Count verwenden.',
      'Filterseite als Zielseite fuer spaetere Dropdown-Integration behalten.',
      'Pruefen, dass routes, intents und privacyDecisions jeweils all enthalten.',
      'Keine Persistenz erwarten.',
      'Provider, Internet und Live-Modell deaktiviert lassen.',
    ],
    sampleChecks: [
      'routes[0] = all',
      'intents[0] = all',
      'privacyDecisions[0] = all',
      'sourceCount > 0',
      'persistedInBrowser = false',
      'persistedOnServer = false',
      'externalSharingAllowed = false',
    ],
    visibleOptionFields: [
      'sourceCount',
      'routes',
      'intents',
      'privacyDecisions',
      'all option',
      'items',
      'localOnly',
      'persistedInBrowser',
      'persistedOnServer',
      'externalSharingAllowed',
    ],
    safety: {
      localTestable: true,
      routeOptionsVisible: true,
      intentOptionsVisible: true,
      privacyOptionsVisible: true,
      allOptionPrepended: true,
      persistedInBrowser: false,
      persistedOnServer: false,
      liveModelEnabled: false,
      providerEnabled: false,
      internetEnabled: false,
      externalSharingAllowed: false,
    },
    nextMilestone: 'Phase 132.3: Secure Master Local Answer Log List Filter Options Handoff',
  };
}
`);

write('frontend/app/api/cmt/master/secure/main/log/list/filter/options/entry/route.ts', `import { NextResponse } from 'next/server';
import { getSecureMasterAnswerLogListFilterOptionsEntry } from '../../../../../../../../../../../lib/cmt-master-answer-log-list-filter-options-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterAnswerLogListFilterOptionsEntry());
}
`);

write('frontend/app/cmt/master/secure/main/log/list/filter/options/entry/page.tsx', `import Link from 'next/link';
import { getSecureMasterAnswerLogListFilterOptionsEntry } from '../../../../../../../../../../lib/cmt-master-answer-log-list-filter-options-entry';

export default function SecureMasterAnswerLogListFilterOptionsEntryPage() {
  const entry = getSecureMasterAnswerLogListFilterOptionsEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 132.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Lokale Filter-Dropdown-Optionen sind sichtbar. Noch keine dauerhafte Speicherung.</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryOptionsPage}>Filter-Optionen</Link></li>
          <li><Link href={entry.optionsStatusPage}>Filter-Optionen Status</Link></li>
          <li><Link href={entry.filterPage}>Filteransicht</Link></li>
          <li><Link href={entry.listPage}>In-Memory-Logliste</Link></li>
          <li><Link href={entry.mainPage}>Secure Master Hauptseite</Link></li>
        </ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sichtbare Options-Felder</h3>
        <ul>{entry.visibleOptionFields.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Empfohlene Nutzung</h3>
        <ol>{entry.recommendedUse.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Sample Checks</h3>
        <ol>{entry.sampleChecks.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Safety State</h3>
        <ul>
          <li>localTestable: {String(entry.safety.localTestable)}</li>
          <li>routeOptionsVisible: {String(entry.safety.routeOptionsVisible)}</li>
          <li>intentOptionsVisible: {String(entry.safety.intentOptionsVisible)}</li>
          <li>privacyOptionsVisible: {String(entry.safety.privacyOptionsVisible)}</li>
          <li>allOptionPrepended: {String(entry.safety.allOptionPrepended)}</li>
          <li>persistedInBrowser: {String(entry.safety.persistedInBrowser)}</li>
          <li>persistedOnServer: {String(entry.safety.persistedOnServer)}</li>
          <li>liveModelEnabled: {String(entry.safety.liveModelEnabled)}</li>
          <li>providerEnabled: {String(entry.safety.providerEnabled)}</li>
          <li>internetEnabled: {String(entry.safety.internetEnabled)}</li>
          <li>externalSharingAllowed: {String(entry.safety.externalSharingAllowed)}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <p><strong>Naechster Meilenstein:</strong> {entry.nextMilestone}</p>
      </section>
    </main>
  );
}
`);

write('README_PHASE132_2.md', `# Phase 132.2 - Secure Master Local Answer Log List Filter Options Entry

Baut eine Entry-Seite fuer die lokal abgeleiteten Filter-Dropdown-Optionen.

Kurz-Namen:

- Store: frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts
- API: /api/cmt/master/secure/main/log/list/filter/options/entry
- UI: /cmt/master/secure/main/log/list/filter/options/entry
- Patch: scripts/p132-2.cjs
- Verify: scripts/v132-2.cjs

Hauptseiten:

- /cmt/master/secure/main/log/list/filter/options
- /cmt/master/secure/main/log/list/filter/options/status
- /cmt/master/secure/main/log/list/filter/options/entry
- /cmt/master/secure/main/log/list/filter
- /cmt/master/secure/main/log/list
- /cmt/master/secure

Status:

- lokal testbar
- Filter-Options-Entry sichtbar
- Route-Optionen sichtbar
- Intent-Optionen sichtbar
- Privacy-Optionen sichtbar
- allOptionPrepended = true
- sourceCount sichtbar
- persistedInBrowser = false
- persistedOnServer = false
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v132-2.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'getSecureMasterAnswerLogListFilterOptionsEntry'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', "phase: '132.2'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', "primaryOptionsPage: '/cmt/master/secure/main/log/list/filter/options'"],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'routeOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'intentOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'privacyOptionsVisible: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'allOptionPrepended: true'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'persistedInBrowser: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'persistedOnServer: false'],
  ['frontend/lib/cmt-master-answer-log-list-filter-options-entry.ts', 'externalSharingAllowed: false'],
  ['frontend/app/api/cmt/master/secure/main/log/list/filter/options/entry/route.ts', 'getSecureMasterAnswerLogListFilterOptionsEntry'],
  ['frontend/app/cmt/master/secure/main/log/list/filter/options/entry/page.tsx', 'Sichtbare Options-Felder'],
  ['README_PHASE132_2.md', 'Secure Master Local Answer Log List Filter Options Entry'],
  ['package.json', 'phase132:2:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 132.2 Secure Master Local Answer Log List Filter Options Entry verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase132:2:verify'] = 'node scripts/v132-2.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 132.2 Secure Master Local Answer Log List Filter Options Entry patch applied.');
