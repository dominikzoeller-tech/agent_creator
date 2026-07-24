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

write('frontend/lib/cmt-demo-report.ts', `import { createCommitteeMvpDemo, type CommitteeMvpDemo } from './cmt-demo';

export type CommitteeDemoReport = {
  phase: '114.1';
  label: 'Gremium Demo Report';
  demo: CommitteeMvpDemo;
  report: {
    title: string;
    question: string;
    verdict: string;
    flowLines: string[];
    riskLines: string[];
    actionLines: string[];
    conclusion: string;
  };
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeDemoReport(question: string): CommitteeDemoReport {
  const demo = createCommitteeMvpDemo(question);
  return {
    phase: '114.1',
    label: 'Gremium Demo Report',
    demo,
    report: {
      title: 'Gremium-Agent MVP Demo Report',
      question: demo.userQuestion,
      verdict: demo.finalAnswer.recommendation,
      flowLines: demo.flow.map((item) => item.step + ' - ' + item.result),
      riskLines: demo.finalAnswer.risks,
      actionLines: demo.finalAnswer.actions,
      conclusion: 'Der MVP-Demo-Flow wurde dry-run-only abgeschlossen. Es wurden keine Provider- oder Netzwerk-Calls ausgefuehrt.',
    },
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeDemoReport() {
  return createCommitteeDemoReport('Soll der Gremium-Agent einen Demo-Report aus dem MVP-Flow erzeugen?');
}
`);

write('frontend/app/api/cmt/demo/report/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeDemoReport, getCommitteeDemoReport } from '../../../../../lib/cmt-demo-report';

export async function GET() {
  return NextResponse.json(getCommitteeDemoReport());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeDemoReport(text));
}
`);

write('frontend/app/cmt/demo/report/page.tsx', `import { getCommitteeDemoReport } from '../../../../lib/cmt-demo-report';

export default function CommitteeDemoReportPage() {
  const report = getCommitteeDemoReport();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 114.1</h1>
      <h2>{report.label}</h2>
      <p>Der MVP-Demo-Flow wird als kompakter Report dargestellt.</p>

      <section>
        <h3>{report.report.title}</h3>
        <p><strong>Frage:</strong> {report.report.question}</p>
        <p><strong>Verdict:</strong> {report.report.verdict}</p>
      </section>

      <section>
        <h3>Flow</h3>
        <ol>{report.report.flowLines.map((line) => <li key={line}>{line}</li>)}</ol>
      </section>

      <section>
        <h3>Risiken</h3>
        <ul>{report.report.riskLines.map((line) => <li key={line}>{line}</li>)}</ul>
      </section>

      <section>
        <h3>Aktionen</h3>
        <ul>{report.report.actionLines.map((line) => <li key={line}>{line}</li>)}</ul>
      </section>

      <section>
        <h3>Abschluss</h3>
        <p>{report.report.conclusion}</p>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {report.provider}</li>
          <li>modelSelected: {report.modelSelected}</li>
          <li>dryRunOnly: {String(report.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(report.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(report.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(report.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE114_1.md', `# Phase 114.1 - Gremium Demo Report

Baut einen kompakten Report fuer den MVP-Demo-Flow.

Kurz-Namen:

- Store: frontend/lib/cmt-demo-report.ts
- API: /api/cmt/demo/report
- UI: /cmt/demo/report
- Patch: scripts/p114-1.cjs
- Verify: scripts/v114-1.cjs

Funktion:

- MVP-Demo nutzen
- Flow, Risiken und Aktionen als Report darstellen
- dry-run-only Abschluss anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v114-1.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-demo-report.ts', 'createCommitteeDemoReport'],
  ['frontend/lib/cmt-demo-report.ts', 'getCommitteeDemoReport'],
  ['frontend/lib/cmt-demo-report.ts', "phase: '114.1'"],
  ['frontend/lib/cmt-demo-report.ts', "label: 'Gremium Demo Report'"],
  ['frontend/lib/cmt-demo-report.ts', 'createCommitteeMvpDemo'],
  ['frontend/lib/cmt-demo-report.ts', "provider: 'none'"],
  ['frontend/lib/cmt-demo-report.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-demo-report.ts', 'providerDispatchAllowed: false'],
  ['frontend/app/api/cmt/demo/report/route.ts', 'createCommitteeDemoReport'],
  ['frontend/app/cmt/demo/report/page.tsx', 'Phase 114.1'],
  ['README_PHASE114_1.md', 'Gremium Demo Report'],
  ['package.json', 'phase114:1:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 114.1 Gremium Demo Report verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase114:1:verify'] = 'node scripts/v114-1.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 114.1 Gremium Demo Report patch applied.');
