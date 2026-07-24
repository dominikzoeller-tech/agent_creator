'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogListResult } from '../../../../../../../lib/cmt-master-answer-log-list';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
].join('
');

export default function SecureMasterAnswerLogListPage() {
  const [text, setText] = useState(defaults);
  const [list, setList] = useState<SecureMasterAnswerLogListResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function createList() {
    setLoading(true);
    try {
      const items = text.split('
').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      setList(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 130.0</h1>
        <h2>Secure Master In-Memory Answer Log List</h2>
        <p><strong>Status:</strong> Mehrere lokale Log-Objekte als In-Memory-Liste. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure/main/log">Einzelnes Answer Log</Link></p>
      </section>

      <section style={card}>
        <h3>Prompts zeilenweise eingeben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <br />
        <button onClick={createList} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Logliste wird erzeugt...' : 'In-Memory-Logliste erzeugen'}
        </button>
      </section>

      {list && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>List State</h3>
            <ul>
              <li>count: {list.count}</li>
              <li>localOnly: {String(list.localOnly)}</li>
              <li>persistedInBrowser: {String(list.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(list.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(list.safety.externalSharingAllowed)}</li>
            </ul>
            <p>{list.note}</p>
          </article>

          {list.items.map((item) => (
            <article key={item.id} style={card}>
              <h3>{item.id}</h3>
              <ul>
                <li>createdAt: {item.createdAt}</li>
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
