import { getCommitteeDemoReport } from '../../../../lib/cmt-demo-report';

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
