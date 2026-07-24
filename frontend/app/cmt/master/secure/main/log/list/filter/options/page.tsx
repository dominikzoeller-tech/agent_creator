'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogListFilterOptionsResult } from '../../../../../../../../../lib/cmt-master-answer-log-list-filter-options';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('
');

export default function SecureMasterAnswerLogListFilterOptionsPage() {
  const [text, setText] = useState(defaults);
  const [result, setResult] = useState<SecureMasterAnswerLogListFilterOptionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function deriveOptions() {
    setLoading(true);
    try {
      const items = text.split('
').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/filter/options', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 132.0</h1>
        <h2>Secure Master Local Answer Log List Filter Options</h2>
        <p><strong>Status:</strong> Lokale Dropdown-Optionen werden aus der In-Memory-Logliste abgeleitet. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure/main/log/list/filter">Zur Filteransicht</Link></p>
      </section>

      <section style={card}>
        <h3>Prompts zeilenweise eingeben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <br />
        <button onClick={deriveOptions} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Optionen werden abgeleitet...' : 'Dropdown-Optionen lokal ableiten'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Options State</h3>
            <ul>
              <li>sourceCount: {result.sourceCount}</li>
              <li>routes: {result.routes.length}</li>
              <li>intents: {result.intents.length}</li>
              <li>privacyDecisions: {result.privacyDecisions.length}</li>
              <li>persistedInBrowser: {String(result.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(result.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.safety.externalSharingAllowed)}</li>
            </ul>
            <p>{result.note}</p>
          </article>

          <article style={card}>
            <h3>Route Dropdown Options</h3>
            <ul>{result.routes.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Intent Dropdown Options</h3>
            <ul>{result.intents.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>

          <article style={card}>
            <h3>Privacy Dropdown Options</h3>
            <ul>{result.privacyDecisions.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </section>
      )}
    </main>
  );
}
