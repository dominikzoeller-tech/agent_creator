'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogResult } from '../../../../../../lib/cmt-master-answer-log';
import type { PrivacyDecisionOption } from '../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterAnswerLogPage() {
  const [input, setInput] = useState('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [log, setLog] = useState<SecureMasterAnswerLogResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function createLog() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/main/log', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input, option }),
      });
      setLog(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 129.0</h1>
        <h2>Secure Master Local Answer Log</h2>
        <p><strong>Status:</strong> Lokales Protokollobjekt pro Anfrage. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure">Zur Hauptseite</Link></p>
      </section>

      <section style={card}>
        <h3>Log erzeugen</h3>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Privacy-Option</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={createLog} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Log wird erzeugt...' : 'Lokales Antwortprotokoll erzeugen'}
        </button>
      </section>

      {log && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Log Entry</h3>
            <ul>
              <li>id: {log.entry.id}</li>
              <li>createdAt: {log.entry.createdAt}</li>
              <li>detectedIntent: {log.entry.detectedIntent}</li>
              <li>finalRoute: {log.entry.finalRoute}</li>
              <li>privacyDecision: {log.entry.privacyDecision}</li>
              <li>option: {log.entry.option}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Badges</h3>
            <ul>{log.entry.badgeSummary.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Safety</h3>
            <ul>
              <li>liveModelEnabled: {String(log.entry.safety.liveModelEnabled)}</li>
              <li>externalSharingAllowed: {String(log.entry.safety.externalSharingAllowed)}</li>
              <li>networkCallAllowed: {String(log.entry.safety.networkCallAllowed)}</li>
              <li>providerDispatchAllowed: {String(log.entry.safety.providerDispatchAllowed)}</li>
              <li>finalDispatchBlocked: {String(log.entry.safety.finalDispatchBlocked)}</li>
            </ul>
          </article>

          <article style={card}>
            <h3>Persistence</h3>
            <ul>
              <li>localOnly: {String(log.localOnly)}</li>
              <li>persistedInBrowser: {String(log.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(log.persistedOnServer)}</li>
            </ul>
            <p>{log.note}</p>
          </article>
        </section>
      )}
    </main>
  );
}
