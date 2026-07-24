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

write('frontend/lib/cmt-master-main-view-model.ts', `import { askSecureMasterUnified, type SecureMasterUnifiedResult } from './cmt-master-unified';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterMainBadge = {
  label: string;
  value: string;
  tone: 'neutral' | 'good' | 'warn' | 'blocked';
};

export type SecureMasterMainViewModel = SecureMasterUnifiedResult & {
  phaseView: '128.0';
  viewLabel: 'Secure Master Main Structured View';
  badges: SecureMasterMainBadge[];
  compactBlocks: {
    title: string;
    body: string;
    priority: 'primary' | 'secondary' | 'safety';
  }[];
  roleCards: {
    title: string;
    subtitle: string;
    body: string;
  }[];
};

function toneForBoolean(value: boolean, goodWhenTrue = true): SecureMasterMainBadge['tone'] {
  if (value === goodWhenTrue) return 'good';
  return 'warn';
}

function badges(result: SecureMasterUnifiedResult): SecureMasterMainBadge[] {
  return [
    { label: 'Route', value: result.finalRoute, tone: 'neutral' },
    { label: 'Intent', value: result.detectedIntent, tone: 'neutral' },
    { label: 'Privacy Gate', value: result.showsPrivacyGate ? 'visible' : 'not needed', tone: result.showsPrivacyGate ? 'warn' : 'good' },
    { label: 'Gremium', value: result.showsCommitteeWhenNeeded ? 'visible' : 'not needed', tone: result.showsCommitteeWhenNeeded ? 'neutral' : 'good' },
    { label: 'Live Model', value: result.liveModelEnabled ? 'enabled' : 'disabled', tone: result.liveModelEnabled ? 'warn' : 'good' },
    { label: 'External Sharing', value: result.externalSharingAllowed ? 'allowed' : 'blocked', tone: result.externalSharingAllowed ? 'warn' : 'blocked' },
    { label: 'Network', value: result.networkCallAllowed ? 'allowed' : 'blocked', tone: result.networkCallAllowed ? 'warn' : 'blocked' },
  ];
}

function compactBlocks(result: SecureMasterUnifiedResult): SecureMasterMainViewModel['compactBlocks'] {
  const blocks = result.unifiedAnswerBlocks.map((block) => ({
    title: block.title,
    body: block.body,
    priority: block.title === 'Lokale Antwort' ? 'primary' as const : block.title === 'Safety' ? 'safety' as const : 'secondary' as const,
  }));

  if (!blocks.some((block) => block.title === 'Safety')) {
    blocks.push({
      title: 'Safety',
      body: 'Kein Provider, kein Internet, kein Live-Modell, keine externe Weitergabe.',
      priority: 'safety',
    });
  }

  return blocks;
}

function roleCards(result: SecureMasterUnifiedResult): SecureMasterMainViewModel['roleCards'] {
  return result.committeeRoles.map((role) => ({
    title: role.name,
    subtitle: role.focus,
    body: role.answer,
  }));
}

export function askSecureMasterMainView(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterMainViewModel {
  const result = askSecureMasterUnified(input, option);
  return {
    ...result,
    phaseView: '128.0',
    viewLabel: 'Secure Master Main Structured View',
    badges: badges(result),
    compactBlocks: compactBlocks(result),
    roleCards: roleCards(result),
  };
}

export function getSecureMasterMainViewDemo() {
  return askSecureMasterMainView('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only');
}
`);

write('frontend/app/api/cmt/master/secure/main/view/route.ts', `import { NextResponse } from 'next/server';
import { askSecureMasterMainView, getSecureMasterMainViewDemo } from '../../../../../../../lib/cmt-master-main-view-model';
import type { PrivacyDecisionOption } from '../../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterMainViewDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  const option = typeof body?.option === 'string' && options.includes(body.option) ? body.option : 'local_only';
  return NextResponse.json(askSecureMasterMainView(input, option));
}
`);

write('frontend/app/cmt/master/secure/page.tsx', `'use client';

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
`);

write('README_PHASE128_0.md', `# Phase 128.0 - Secure Master Structured Main View

Strukturiert die Secure-Master-Hauptansicht optisch klarer.

Kurz-Namen:

- Store: frontend/lib/cmt-master-main-view-model.ts
- API: /api/cmt/master/secure/main/view
- UI: /cmt/master/secure
- Patch: scripts/p128-0.cjs
- Verify: scripts/v128-0.cjs

Wirkung:

- Status-Badges fuer Route, Intent, Privacy, Gremium, Live Model, Sharing und Network.
- Kompakte Antwortbloecke.
- Lesbarere 5er-Gremium-Karten.
- Hauptseite wirkt mehr wie ein lokales Produkt.

Status:

- lokal testbar
- strukturierte Hauptansicht sichtbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v128-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-main-view-model.ts', 'askSecureMasterMainView'],
  ['frontend/lib/cmt-master-main-view-model.ts', 'getSecureMasterMainViewDemo'],
  ['frontend/lib/cmt-master-main-view-model.ts', "phaseView: '128.0'"],
  ['frontend/lib/cmt-master-main-view-model.ts', 'badges'],
  ['frontend/lib/cmt-master-main-view-model.ts', 'compactBlocks'],
  ['frontend/lib/cmt-master-main-view-model.ts', 'roleCards'],
  ['frontend/app/api/cmt/master/secure/main/view/route.ts', 'askSecureMasterMainView'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Structured Main View'],
  ['frontend/app/cmt/master/secure/page.tsx', 'Status-Badges'],
  ['frontend/app/cmt/master/secure/page.tsx', '5er-Gremium'],
  ['README_PHASE128_0.md', 'Secure Master Structured Main View'],
  ['package.json', 'phase128:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 128.0 Secure Master Structured Main View verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase128:0:verify'] = 'node scripts/v128-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 128.0 Secure Master Structured Main View patch applied.');
