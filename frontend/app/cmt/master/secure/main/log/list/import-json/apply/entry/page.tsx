import Link from 'next/link';
import { getSecureMasterAnswerLogJsonImportApplyEntry } from '../../../../../../../../../lib/cmt-master-answer-log-list-json-import-apply-entry';

export default function SecureMasterAnswerLogJsonImportApplyEntryPage() {
  const entry = getSecureMasterAnswerLogJsonImportApplyEntry();
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 139.2</h1>
        <h2>{entry.label}</h2>
        <p><strong>Status:</strong> Manual-Apply-Entry ist sichtbar. Validierte Export-JSON-Daten koennen manuell in den Browser-Speicher uebernommen werden.</p>
        <p><strong>Storage Key:</strong> {entry.storageKey}</p>
      </section>

      <section style={card}>
        <h3>Hauptlinks</h3>
        <ul>
          <li><Link href={entry.primaryApplyPage}>Manual-Apply-Seite</Link></li>
          <li><Link href={entry.applyStatusPage}>Manual-Apply-Status</Link></li>
          <li><Link href={entry.importPage}>JSON-Import-Seite</Link></li>
          <li><Link href={entry.importStatusPage}>JSON-Import-Status</Link></li>
          <li><Link href={entry.exportPage}>JSON-Export-Seite</Link></li>
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
        <h3>Apply State</h3>
        <ul>{Object.entries(entry.applyState).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Apply Payload Preview</h3>
        <ul>{Object.entries(entry.status.applyDemo.applyPayloadPreview).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Demo Validation</h3>
        <ul>{Object.entries(entry.status.applyDemo.importPreview.validation).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}</ul>
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
