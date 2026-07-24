import Link from 'next/link';
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
