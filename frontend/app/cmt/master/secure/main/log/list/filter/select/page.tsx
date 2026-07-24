'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogListFilterSelectResult } from '../../../../../../../../lib/cmt-master-answer-log-list-filter-select';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('
');

export default function SecureMasterAnswerLogListFilterSelectPage() {
  const [text, setText] = useState(defaults);
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const [intent, setIntent] = useState('all');
  const [privacyDecision, setPrivacyDecision] = useState('all');
  const [result, setResult] = useState<SecureMasterAnswerLogListFilterSelectResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  async function applySelectFilter() {
    setLoading(true);
    try {
      const items = text.split('
').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/filter/select', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items, search, route, intent, privacyDecision }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  const routeOptions = result?.options.routes ?? ['all'];
  const intentOptions = result?.options.intents ?? ['all'];
  const privacyOptions = result?.options.privacyDecisions ?? ['all'];

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 133.0</h1>
        <h2>Secure Master Local Answer Log List Filter Select</h2>
        <p><strong>Status:</strong> Dropdown-Optionen werden lokal abgeleitet und in eine Select-Filteransicht integriert. Noch keine dauerhafte Speicherung.</p>
        <p><Link href="/cmt/master/secure/main/log/list/filter/options">Filter-Optionen öffnen</Link></p>
      </section>

      <section style={card}>
        <h3>Prompts zeilenweise eingeben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />

        <h3>Lokale Select-Filter</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', maxWidth: 980 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Suche inputPreview" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <select value={route} onChange={(event) => setRoute(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>
            {routeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={intent} onChange={(event) => setIntent(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>
            {intentOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={privacyDecision} onChange={(event) => setPrivacyDecision(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>
            {privacyOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <button onClick={applySelectFilter} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Select-Filter wird angewendet...' : 'Dropdown-Filter lokal anwenden'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Select Filter State</h3>
            <ul>
              <li>sourceCount: {result.filter.sourceCount}</li>
              <li>filteredCount: {result.filter.filteredCount}</li>
              <li>routeOptions: {result.options.routes.length}</li>
              <li>intentOptions: {result.options.intents.length}</li>
              <li>privacyOptions: {result.options.privacyDecisions.length}</li>
              <li>routeSelectVisible: {String(result.selectState.routeSelectVisible)}</li>
              <li>intentSelectVisible: {String(result.selectState.intentSelectVisible)}</li>
              <li>privacySelectVisible: {String(result.selectState.privacySelectVisible)}</li>
              <li>persistedInBrowser: {String(result.selectState.persistedInBrowser)}</li>
              <li>persistedOnServer: {String(result.selectState.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.selectState.externalSharingAllowed)}</li>
            </ul>
          </article>

          {result.filter.items.map((item) => (
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
