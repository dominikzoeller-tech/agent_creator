const fs = require('fs');
const path = require('path');

const root = process.cwd();
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('WROTE', rel);
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + '\n', 'utf8');

write('frontend/app/cmt/master/secure/page.tsx', `'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SecureMasterUnifiedResult } from '../../../../lib/cmt-master-unified';
import type { PrivacyDecisionOption } from '../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterMainPage() {
  const [input, setInput] = useState('Was kannst du als Secure Master aktuell?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<SecureMasterUnifiedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/unified', {
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
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ ...card, marginBottom: 16 }}>
        <h1>Secure Master Agent</h1>
        <h2>Unified Main View</h2>
        <p><strong>Status:</strong> Hauptansicht nutzt jetzt den lokalen Unified Flow. Noch kein Live-KI-Modell.</p>
        <p>Lokale Antwort, Routing, Privacy Gate, 5er-Gremium und Safety State werden hier gemeinsam angezeigt.</p>
      </section>

      <section style={card}>
        <h3>Frage an den Secure Master</h3>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} style={{ width: '100%', maxWidth: 920, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
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
          {result.unifiedAnswerBlocks.map((block) => (
            <article key={block.title} style={card}>
              <h3>{block.title}</h3>
              <p>{block.body}</p>
            </article>
          ))}

          {result.committeeRoles.length > 0 && (
            <article style={card}>
              <h3>5 Rollen</h3>
              {result.committeeRoles.map((role) => (
                <div key={role.id} style={{ marginBottom: 12 }}>
                  <h4>{role.name}</h4>
                  <p><strong>Fokus:</strong> {role.focus}</p>
                  <p>{role.answer}</p>
                </div>
              ))}
            </article>
          )}

          <article style={card}>
            <h3>Flags</h3>
            <ul>
              <li>detectedIntent: {result.detectedIntent}</li>
              <li>finalRoute: {result.finalRoute}</li>
              <li>showsPrivacyGate: {String(result.showsPrivacyGate)}</li>
              <li>showsQualityAnswer: {String(result.showsQualityAnswer)}</li>
              <li>showsCommitteeWhenNeeded: {String(result.showsCommitteeWhenNeeded)}</li>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>liveModelEnabled: {String(result.liveModelEnabled)}</li>
            </ul>
          </article>
        </section>
      )}

      <section style={{ ...card, marginTop: 16 }}>
        <h3>Kontrollseiten</h3>
        <ul>
          <li><Link href="/cmt/master/secure/unified">Unified Flow Kontrollseite</Link></li>
          <li><Link href="/cmt/master/secure/unified/status">Unified Status</Link></li>
          <li><Link href="/cmt/master/secure/unified/entry">Unified Entry</Link></li>
          <li><Link href="/cmt/master/secure/quality">Quality-Testseite</Link></li>
          <li><Link href="/cmt/master/secure/committee">Committee-Testseite</Link></li>
          <li><Link href="/cmt/privacy">Privacy Gate</Link></li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE127_0.md', `# Phase 127.0 - Secure Master Main Unified View

Baut den Unified Flow als echte Hauptansicht in /cmt/master/secure ein.

Kurz-Namen:

- UI: /cmt/master/secure
- nutzt API: /api/cmt/master/secure/unified
- nutzt Store: frontend/lib/cmt-master-unified.ts
- Patch: scripts/p127-0.cjs
- Verify: scripts/v127-0.cjs

Wirkung:

- /cmt/master/secure zeigt jetzt direkt den Unified Flow.
- Nutzer muss /cmt/master/secure/unified nicht mehr separat öffnen.
- Kontrollseiten bleiben erhalten.
- Kein Provider.
- Kein Internet.
- Kein Live-Modell.

Status:

- lokal testbar
- Hauptseite nutzt Unified Flow
- Quality-Antwort sichtbar
- Gremium bei Bedarf sichtbar
- Privacy Gate bei Bedarf sichtbar
- externalSharingAllowed = false
`);

write('scripts/v127-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/app/cmt/master/secure/page.tsx', 'Unified Main View'],
  ['frontend/app/cmt/master/secure/page.tsx', '/api/cmt/master/secure/unified'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Secure Master fragen'],
  ['frontend/app/cmt/master/secure/page.tsx', 'unifiedAnswerBlocks'],
  ['frontend/app/cmt/master/secure/page.tsx', '5 Rollen'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Kontrollseiten'],
  ['frontend/app/cmt/master/secure/page.tsx', 'externalSharingAllowed'],
  ['README_PHASE127_0.md', 'Secure Master Main Unified View'],
  ['README_PHASE127_0.md', '/cmt/master/secure'],
  ['README_PHASE127_0.md', 'Hauptseite nutzt Unified Flow'],
  ['package.json', 'phase127:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 127.0 Secure Master Main Unified View verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase127:0:verify'] = 'node scripts/v127-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 127.0 Secure Master Main Unified View patch applied.');
