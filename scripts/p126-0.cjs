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

write('frontend/lib/cmt-master-unified.ts', `import { askSecureMasterCommittee, type SecureMasterCommitteeResult } from './cmt-master-committee';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type SecureMasterUnifiedResult = SecureMasterCommitteeResult & {
  phaseUnified: '126.0';
  unifiedLabel: 'Secure Master Unified Main Flow';
  unifiedMainPage: '/cmt/master/secure';
  showsPrivacyGate: boolean;
  showsQualityAnswer: true;
  showsCommitteeWhenNeeded: boolean;
  unifiedAnswerBlocks: {
    title: string;
    body: string;
  }[];
};

function buildBlocks(result: SecureMasterCommitteeResult) {
  const blocks = [
    {
      title: 'Lokale Antwort',
      body: result.improvedAnswer || result.userVisibleAnswer,
    },
    {
      title: 'Routing',
      body: 'Intent: ' + result.detectedIntent + ' | Route: ' + result.finalRoute + ' | Privacy: ' + result.privacy.decision.decision,
    },
  ];

  if (result.requiresUserApproval || result.privacy.decision.decision !== 'allow_local_only') {
    blocks.push({
      title: 'Privacy Gate',
      body: 'Datenschutzprüfung aktiv. Externe Weitergabe bleibt blockiert. Sichere Verarbeitung: local_only oder anonymisierte Vorschau.',
    });
  }

  if (result.committeeTriggered) {
    blocks.push({
      title: '5er-Gremium',
      body: result.committeeSummary + ' Empfehlung: ' + result.finalRecommendation,
    });
  }

  blocks.push({
    title: 'Safety',
    body: 'Kein Provider, kein Internet, kein Live-Modell, keine externe Weitergabe.',
  });

  return blocks;
}

export function askSecureMasterUnified(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterUnifiedResult {
  const result = askSecureMasterCommittee(input, option);
  return {
    ...result,
    phaseUnified: '126.0',
    unifiedLabel: 'Secure Master Unified Main Flow',
    unifiedMainPage: '/cmt/master/secure',
    showsPrivacyGate: result.requiresUserApproval || result.privacy.decision.decision !== 'allow_local_only',
    showsQualityAnswer: true,
    showsCommitteeWhenNeeded: result.committeeTriggered,
    unifiedAnswerBlocks: buildBlocks(result),
  };
}

export function getSecureMasterUnifiedDemo() {
  return askSecureMasterUnified('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only');
}
`);

write('frontend/app/api/cmt/master/secure/unified/route.ts', `import { NextResponse } from 'next/server';
import { askSecureMasterUnified, getSecureMasterUnifiedDemo } from '../../../../../../lib/cmt-master-unified';
import type { PrivacyDecisionOption } from '../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterUnifiedDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  const option = typeof body?.option === 'string' && options.includes(body.option) ? body.option : 'local_only';
  return NextResponse.json(askSecureMasterUnified(input, option));
}
`);

write('frontend/app/cmt/master/secure/unified/page.tsx', `'use client';

import { useState } from 'react';
import type { SecureMasterUnifiedResult } from '../../../../../lib/cmt-master-unified';
import type { PrivacyDecisionOption } from '../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterUnifiedPage() {
  const [input, setInput] = useState('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?');
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
        <h1>Phase 126.0</h1>
        <h2>Secure Master Unified Main Flow</h2>
        <p><strong>Status:</strong> Privacy Gate, Quality-Antwort und 5er-Gremium in einem lokalen Flow. Noch kein Live-KI-Modell.</p>
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
          {loading ? 'Secure Master prüft...' : 'Unified Flow testen'}
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
              <h3>5 Rollen direkt im Hauptflow</h3>
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
              <li>showsPrivacyGate: {String(result.showsPrivacyGate)}</li>
              <li>showsQualityAnswer: {String(result.showsQualityAnswer)}</li>
              <li>showsCommitteeWhenNeeded: {String(result.showsCommitteeWhenNeeded)}</li>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>liveModelEnabled: {String(result.liveModelEnabled)}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
`);

write('README_PHASE126_0.md', `# Phase 126.0 - Secure Master Unified Main Flow

Integriert Privacy Gate, lokale Antwortqualitaet und 5er-Gremium in einen zentralen Secure-Master-Flow.

Kurz-Namen:

- Store: frontend/lib/cmt-master-unified.ts
- API: /api/cmt/master/secure/unified
- UI: /cmt/master/secure/unified
- Patch: scripts/p126-0.cjs
- Verify: scripts/v126-0.cjs

Ziel:

- Nutzer muss nicht mehr zwischen Quality- und Committee-Seite wechseln.
- Secure Master zeigt lokale Antwort, Routing, Privacy Gate und Gremiumsausgabe zusammen.
- Noch kein Provider.
- Noch kein Internet.
- Noch kein Live-Modell.

Status:

- lokal testbar
- Unified Flow sichtbar
- Quality-Antwort sichtbar
- Gremium bei Bedarf sichtbar
- Privacy Gate bei Bedarf sichtbar
- externalSharingAllowed = false
`);

write('scripts/v126-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-unified.ts', 'askSecureMasterUnified'],
  ['frontend/lib/cmt-master-unified.ts', 'getSecureMasterUnifiedDemo'],
  ['frontend/lib/cmt-master-unified.ts', "phaseUnified: '126.0'"],
  ['frontend/lib/cmt-master-unified.ts', "unifiedMainPage: '/cmt/master/secure'"],
  ['frontend/lib/cmt-master-unified.ts', 'showsCommitteeWhenNeeded'],
  ['frontend/lib/cmt-master-unified.ts', 'unifiedAnswerBlocks'],
  ['frontend/app/api/cmt/master/secure/unified/route.ts', 'askSecureMasterUnified'],
  ['frontend/app/cmt/master/secure/unified/page.tsx', 'Unified Flow testen'],
  ['frontend/app/cmt/master/secure/unified/page.tsx', '5 Rollen direkt im Hauptflow'],
  ['README_PHASE126_0.md', 'Secure Master Unified Main Flow'],
  ['package.json', 'phase126:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 126.0 Secure Master Unified Main Flow verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase126:0:verify'] = 'node scripts/v126-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 126.0 Secure Master Unified Main Flow patch applied.');
