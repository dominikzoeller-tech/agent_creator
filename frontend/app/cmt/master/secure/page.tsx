'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterMainViewModel } from '../../../../lib/cmt-master-main-view-model';
import type { PrivacyDecisionOption } from '../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];
const toneColor = { neutral: '#f1f5f9', good: '#dcfce7', warn: '#fef3c7', blocked: '#fee2e2' } as const;

export default function SecureMasterMainPage() {
  const [input, setInput] = useState('Was kannst du als Secure Master aktuell?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<SecureMasterMainViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 16, padding: 16, background: '#fff' };

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/main/view', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input, option }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Secure Master Agent</h1>
        <h2>Structured Main View</h2>
        <p><strong>Status:</strong> Hauptansicht ist klarer strukturiert. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Frage an den Secure Master</h3>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} style={{ width: '100%', maxWidth: 980, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Privacy-Option</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Secure Master prüft...' : 'Secure Master fragen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Status-Badges</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {result.badges.map((badge) => (
                <span key={badge.label} style={{ background: toneColor[badge.tone], padding: '8px 10px', borderRadius: 999, border: '1px solid #ddd' }}>
                  <strong>{badge.label}:</strong> {badge.value}
                </span>
              ))}
            </div>
          </article>

          <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {result.compactBlocks.map((block) => (
              <article key={block.title} style={{ ...card, borderColor: block.priority === 'primary' ? '#2563eb' : block.priority === 'safety' ? '#dc2626' : '#ddd' }}>
                <h3>{block.title}</h3>
                <p>{block.body}</p>
              </article>
            ))}
          </section>

          {result.roleCards.length > 0 && (
            <article style={card}>
              <h3>5er-Gremium</h3>
              <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {result.roleCards.map((role) => (
                  <div key={role.title} style={{ border: '1px solid #ddd', borderRadius: 14, padding: 14 }}>
                    <h4>{role.title}</h4>
                    <p><strong>Fokus:</strong> {role.subtitle}</p>
                    <p>{role.body}</p>
                  </div>
                ))}
              </section>
            </article>
          )}
        </section>
      )}

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Kontrollseiten</h3>
        <ul>
          <li><Link href="/cmt/master/secure/main/status">Main Status</Link></li>
          <li><Link href="/cmt/master/secure/main/entry">Main Entry</Link></li>
          <li><Link href="/cmt/master/secure/unified">Unified Kontrollseite</Link></li>
          <li><Link href="/cmt/master/secure/quality">Quality-Testseite</Link></li>
          <li><Link href="/cmt/master/secure/committee">Committee-Testseite</Link></li>
          <li><Link href="/cmt/privacy">Privacy Gate</Link></li>
        </ul>
      </section>
    </main>
  );
}
