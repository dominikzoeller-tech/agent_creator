'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SecureMasterAnswerLogBrowserStoreResult } from '../../../../../../../lib/cmt-master-answer-log-list-browser-store';
import { SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY } from '../../../../../../../lib/cmt-master-answer-log-list-browser-store';

const defaults = [
  'Was kannst du als Secure Master aktuell?',
  'Soll ich den Secure Master Agent jetzt live schalten?',
  'Hier sind interne Kundendaten. Was darfst du damit machen?',
  'Soll ich fuer diese Entscheidung das Gremium fragen?',
  'Wie ist morgen das Wetter?',
  'Baue mir spaeter einen Trading-Agenten.',
].join('
');

type StoredPayload = {
  savedAt: string;
  text: string;
  search: string;
  route: string;
  intent: string;
  privacyDecision: string;
};

export default function SecureMasterAnswerLogBrowserStorePage() {
  const [text, setText] = useState(defaults);
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const [intent, setIntent] = useState('all');
  const [privacyDecision, setPrivacyDecision] = useState('all');
  const [result, setResult] = useState<SecureMasterAnswerLogBrowserStoreResult | null>(null);
  const [storedAt, setStoredAt] = useState<string>('nicht geladen');
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#fff' };

  useEffect(() => {
    const raw = window.localStorage.getItem(SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as StoredPayload;
      setText(parsed.text || defaults);
      setSearch(parsed.search || '');
      setRoute(parsed.route || 'all');
      setIntent(parsed.intent || 'all');
      setPrivacyDecision(parsed.privacyDecision || 'all');
      setStoredAt(parsed.savedAt || 'geladen');
    } catch {
      setStoredAt('ungueltiger localStorage-Inhalt');
    }
  }, []);

  async function applyBrowserStore() {
    setLoading(true);
    try {
      const items = text.split('
').map((line) => line.trim()).filter(Boolean).map((input) => ({ input, option: 'local_only' }));
      const response = await fetch('/api/cmt/master/secure/main/log/list/browser-store', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items, search, route, intent, privacyDecision }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  function saveLocal() {
    const payload: StoredPayload = {
      savedAt: new Date().toISOString(),
      text,
      search,
      route,
      intent,
      privacyDecision,
    };
    window.localStorage.setItem(SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY, JSON.stringify(payload));
    setStoredAt(payload.savedAt);
  }

  function clearLocal() {
    window.localStorage.removeItem(SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY);
    setStoredAt('geloescht');
  }

  const routeOptions = result?.mainSelect.select.options.routes ?? ['all'];
  const intentOptions = result?.mainSelect.select.options.intents ?? ['all'];
  const privacyOptions = result?.mainSelect.select.options.privacyDecisions ?? ['all'];

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Phase 135.0</h1>
        <h2>Secure Master Browser Log Store Preparation</h2>
        <p><strong>Status:</strong> Browserseitige Speicherung ist vorbereitet. Server-Persistenz bleibt aus.</p>
        <p><strong>Storage Key:</strong> {SECURE_MASTER_ANSWER_LOG_BROWSER_STORAGE_KEY}</p>
        <p><Link href="/cmt/master/secure/main/log/list">Haupt-Logliste</Link> · <Link href="/cmt/master/secure">Secure Master</Link></p>
      </section>

      <section style={card}>
        <h3>Lokale Log-Eingaben</h3>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Filter</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', maxWidth: 980 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Suche inputPreview" style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
          <select value={route} onChange={(event) => setRoute(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>{routeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={intent} onChange={(event) => setIntent(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>{intentOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={privacyDecision} onChange={(event) => setPrivacyDecision(event.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>{privacyOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <button onClick={applyBrowserStore} disabled={loading} style={{ padding: '10px 16px', borderRadius: 10 }}>{loading ? 'wird vorbereitet...' : 'Lokal auswerten'}</button>
          <button onClick={saveLocal} style={{ padding: '10px 16px', borderRadius: 10 }}>In Browser speichern</button>
          <button onClick={clearLocal} style={{ padding: '10px 16px', borderRadius: 10 }}>Browser-Speicher loeschen</button>
        </div>
        <p><strong>localStorage Status:</strong> {storedAt}</p>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Browser Persistence State</h3>
            <ul>
              <li>prepared: {String(result.browserPersistence.prepared)}</li>
              <li>localStorageKeyVisible: {String(result.browserPersistence.localStorageKeyVisible)}</li>
              <li>canSaveInBrowser: {String(result.browserPersistence.canSaveInBrowser)}</li>
              <li>canLoadFromBrowser: {String(result.browserPersistence.canLoadFromBrowser)}</li>
              <li>canClearBrowserLogs: {String(result.browserPersistence.canClearBrowserLogs)}</li>
              <li>persistedInBrowser: {result.browserPersistence.persistedInBrowser}</li>
              <li>persistedOnServer: {String(result.browserPersistence.persistedOnServer)}</li>
              <li>externalSharingAllowed: {String(result.safety.externalSharingAllowed)}</li>
            </ul>
          </article>
          <article style={card}>
            <h3>Counts</h3>
            <ul>
              <li>sourceCount: {result.mainSelect.select.filter.sourceCount}</li>
              <li>filteredCount: {result.mainSelect.select.filter.filteredCount}</li>
              <li>routeOptions: {result.mainSelect.select.options.routes.length}</li>
              <li>intentOptions: {result.mainSelect.select.options.intents.length}</li>
              <li>privacyOptions: {result.mainSelect.select.options.privacyDecisions.length}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
