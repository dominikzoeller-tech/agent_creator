import Link from 'next/link';
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
