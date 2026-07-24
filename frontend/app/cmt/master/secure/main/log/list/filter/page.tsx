'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogListFilterResult } from '../../../../../../../../lib/cmt-master-answer-log-list-filter';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('
');

export default function SecureMasterAnswerLogListFilterPage() {
  const [text, setText] = useState(defaults);
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const [intent, setIntent] = useState('all');
  const [privacyDecision, setPrivacyDecision] = useState('all');
  const [result, setResult] = useState<SecureMasterAnswerLogListFilterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function filterList() {
    setLoading(true);
    try {
      const items = text.split('
').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/filter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items, search, route, intent, privacyDecision }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 131.0</h1>
        <h2>Secure Master Local Answer Log List Filter</h2>
        <p><strong>Status:</strong> Lokale Suche und Filter fuer die In-Memory-Logliste. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure/main/log/list">Zur Logliste</Link></p>
      </section>

      <section style={card}>
        <h3>Prompts zeilenweise eingeben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />

        <h3>Filter</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', maxWidth: 980 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Suche inputPreview" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <input value={route} onChange={(event) => setRoute(event.target.value)} placeholder="Route oder all" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <input value={intent} onChange={(event) => setIntent(event.target.value)} placeholder="Intent oder all" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <input value={privacyDecision} onChange={(event) => setPrivacyDecision(event.target.value)} placeholder="Privacy oder all" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
        </div>

        <button onClick={filterList} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Filter wird angewendet...' : 'Logliste lokal filtern'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Filter State</h3>
            <ul>
              <li>sourceCount: {result.sourceCount}</li>
              <li>filteredCount: {result.filteredCount}</li>
              <li>search: {result.filters.search || '(leer)'}</li>
              <li>route: {result.filters.route}</li>
              <li>intent: {result.filters.intent}</li>
              <li>privacyDecision: {result.filters.privacyDecision}</li>
              <li>persistedInBrowser: {String(result.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(result.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.safety.externalSharingAllowed)}</li>
            </ul>
          </article>

          {result.items.map((item) => (
            <article key={item.id} style={card}>
              <h3>{item.id}</h3>
              <ul>
                <li>inputPreview: {item.inputPreview}</li>
                <li>intent: {item.detectedIntent}</li>
                <li>route: {item.finalRoute}</li>
                <li>privacyDecision: {item.privacyDecision}</li>
                <li>badges: {item.badgeSummary.length}</li>
                <li>finalDispatchBlocked: {String(item.safety.finalDispatchBlocked)}</li>
              </ul>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
