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

write('frontend/lib/cmt-master-committee.ts', `import { askSecureMasterQuality, type SecureMasterQualityResult } from './cmt-master-quality';
import type { PrivacyDecisionOption } from './cmt-privacy-decision';

export type CommitteeRoleId = 'visionary' | 'skeptic' | 'operator' | 'privacy_risk' | 'business_value';

export type CommitteeRoleAnswer = {
  id: CommitteeRoleId;
  name: string;
  focus: string;
  answer: string;
};

export type SecureMasterCommitteeResult = SecureMasterQualityResult & {
  phaseCommittee: '125.0';
  committeeLabel: 'Secure Master Committee Integration';
  committeeTriggered: boolean;
  committeeRoles: CommitteeRoleAnswer[];
  committeeSummary: string;
  finalRecommendation: string;
};

function roleAnswers(input: string): CommitteeRoleAnswer[] {
  const trimmed = input.trim() || 'Welche Entscheidung soll bewertet werden?';
  return [
    {
      id: 'visionary',
      name: 'Visionär',
      focus: 'Zielbild, Chancen, langfristiger Nutzen',
      answer: 'Chance prüfen: Wenn die Entscheidung das Ziel des Master-Agenten stärkt, kann sie sinnvoll sein. Wichtig ist, sie nicht vor Datenschutz und Stabilität zu stellen.',
    },
    {
      id: 'skeptic',
      name: 'Skeptiker',
      focus: 'Risiken, Gegenargumente, blinde Flecken',
      answer: 'Risiko prüfen: Nicht zu früh live gehen, keine internen Daten extern senden und keine Fähigkeiten behaupten, die lokal noch nicht sicher funktionieren.',
    },
    {
      id: 'operator',
      name: 'Umsetzer',
      focus: 'Nächster konkreter Schritt, Testbarkeit, Aufwand',
      answer: 'Praktisch vorgehen: Eine kleine lokale Verbesserung bauen, verifizieren, builden, committen und erst danach den nächsten Schritt starten.',
    },
    {
      id: 'privacy_risk',
      name: 'Datenschutz & Risiko',
      focus: 'Privacy Gate, interne Daten, Freigabegrenzen',
      answer: 'Datenschutz bleibt vorrangig: local_only ist sicher. Anonymisierung nur als Vorschau. approve_external_send bleibt blockiert, bis eine separate Live-Freigabe existiert.',
    },
    {
      id: 'business_value',
      name: 'Wirtschaftlichkeit & Praxisnutzen',
      focus: 'Nutzen, Priorität, Wirkung für den Alltag',
      answer: 'Nutzen entsteht, wenn der Agent verlässlich routet, klar antwortet und Entscheidungen beschleunigt. Priorität hat daher Qualität vor Live-Schaltung.',
    },
  ].map((role) => ({ ...role, answer: role.answer + ' Eingabe: ' + trimmed.slice(0, 120) }));
}

function summary(triggered: boolean) {
  if (!triggered) {
    return 'Das 5er-Gremium wurde nicht zwingend benötigt. Die Eingabe kann lokal direkt oder über das Privacy Gate verarbeitet werden.';
  }
  return 'Das 5er-Gremium bewertet die Frage aus Chancen, Risiken, Umsetzung, Datenschutz und Praxisnutzen. Alle Rollen empfehlen: lokal weiter testen, Datenschutzgrenzen einhalten und keine Live-Schaltung ohne separate Freigabe.';
}

function recommendation(triggered: boolean) {
  if (!triggered) {
    return 'Lokal beantworten. Falls die Frage zur Entscheidung wird, das Gremium erneut aktivieren.';
  }
  return 'Empfehlung: Nicht live schalten. Erst die lokale Qualität und Gremiumsausgabe stabilisieren, danach Provider-Readiness vorbereiten, aber weiterhin blockiert lassen.';
}

export function askSecureMasterCommittee(input: string, option: PrivacyDecisionOption = 'local_only'): SecureMasterCommitteeResult {
  const quality = askSecureMasterQuality(input, option);
  const committeeTriggered = quality.detectedIntent === 'committee_decision' || quality.finalRoute === 'committee';
  return {
    ...quality,
    phaseCommittee: '125.0',
    committeeLabel: 'Secure Master Committee Integration',
    committeeTriggered,
    committeeRoles: committeeTriggered ? roleAnswers(input) : [],
    committeeSummary: summary(committeeTriggered),
    finalRecommendation: recommendation(committeeTriggered),
  };
}

export function getSecureMasterCommitteeDemo() {
  return askSecureMasterCommittee('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?', 'local_only');
}
`);

write('frontend/app/api/cmt/master/secure/committee/route.ts', `import { NextResponse } from 'next/server';
import { askSecureMasterCommittee, getSecureMasterCommitteeDemo } from '../../../../../../lib/cmt-master-committee';
import type { PrivacyDecisionOption } from '../../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export async function GET() {
  return NextResponse.json(getSecureMasterCommitteeDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body?.input === 'string' ? body.input : '';
  const option = typeof body?.option === 'string' && options.includes(body.option) ? body.option : 'local_only';
  return NextResponse.json(askSecureMasterCommittee(input, option));
}
`);

write('frontend/app/cmt/master/secure/committee/page.tsx', `'use client';

import { useState } from 'react';
import type { SecureMasterCommitteeResult } from '../../../../../lib/cmt-master-committee';
import type { PrivacyDecisionOption } from '../../../../../lib/cmt-privacy-decision';

const options: PrivacyDecisionOption[] = ['local_only', 'anonymize_then_send', 'approve_external_send', 'cancel'];

export default function SecureMasterCommitteePage() {
  const [input, setInput] = useState('Soll ich den Secure Master Agent jetzt live schalten oder vorher weiter lokal testen?');
  const [option, setOption] = useState<PrivacyDecisionOption>('local_only');
  const [result, setResult] = useState<SecureMasterCommitteeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const card = { border: '1px solid #ddd', borderRadius: 12, padding: 16 };

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/cmt/master/secure/committee', {
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
        <h1>Phase 125.0</h1>
        <h2>Secure Master Committee Integration</h2>
        <p><strong>Status:</strong> 5er-Gremium lokal in Secure Master integriert. Noch kein Live-KI-Modell.</p>
      </section>

      <section style={card}>
        <h3>Frage testen</h3>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} style={{ width: '100%', maxWidth: 920, padding: 12, borderRadius: 12, border: '1px solid #ccc' }} />
        <h3>Privacy-Option</h3>
        <select value={option} onChange={(event) => setOption(event.target.value as PrivacyDecisionOption)} style={{ padding: 10, borderRadius: 10 }}>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <br />
        <button onClick={ask} disabled={loading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10 }}>
          {loading ? 'Gremium prüft...' : 'Secure Master + Gremium testen'}
        </button>
      </section>

      {result && (
        <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <article style={card}>
            <h3>Verbesserte Antwort</h3>
            <p>{result.improvedAnswer}</p>
          </article>
          <article style={card}>
            <h3>Gremium</h3>
            <ul>
              <li>committeeTriggered: {String(result.committeeTriggered)}</li>
              <li>detectedIntent: {result.detectedIntent}</li>
              <li>finalRoute: {result.finalRoute}</li>
            </ul>
          </article>
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
            <h3>Zusammenfassung</h3>
            <p>{result.committeeSummary}</p>
            <p><strong>Empfehlung:</strong> {result.finalRecommendation}</p>
          </article>
          <article style={card}>
            <h3>Safety</h3>
            <ul>
              <li>externalSharingAllowed: {String(result.externalSharingAllowed)}</li>
              <li>liveModelEnabled: {String(result.liveModelEnabled)}</li>
              <li>provider: {result.provider}</li>
              <li>networkCallAllowed: {String(result.networkCallAllowed)}</li>
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}
`);

write('README_PHASE125_0.md', `# Phase 125.0 - Secure Master Committee Integration

Integriert das 5er-Gremium direkt in den Secure Master.

Kurz-Namen:

- Store: frontend/lib/cmt-master-committee.ts
- API: /api/cmt/master/secure/committee
- UI: /cmt/master/secure/committee
- Patch: scripts/p125-0.cjs
- Verify: scripts/v125-0.cjs

Rollen:

- Visionär
- Skeptiker
- Umsetzer
- Datenschutz & Risiko
- Wirtschaftlichkeit & Praxisnutzen

Status:

- lokal testbar
- 5er-Gremium sichtbar
- noch nicht live mit KI-Modell
- kein Provider
- kein Internet
- externalSharingAllowed = false
`);

write('scripts/v125-0.cjs', `const fs = require('fs');
const checks = [
  ['frontend/lib/cmt-master-committee.ts', 'askSecureMasterCommittee'],
  ['frontend/lib/cmt-master-committee.ts', 'getSecureMasterCommitteeDemo'],
  ['frontend/lib/cmt-master-committee.ts', "phaseCommittee: '125.0'"],
  ['frontend/lib/cmt-master-committee.ts', 'Visionär'],
  ['frontend/lib/cmt-master-committee.ts', 'Skeptiker'],
  ['frontend/lib/cmt-master-committee.ts', 'Umsetzer'],
  ['frontend/lib/cmt-master-committee.ts', 'Datenschutz & Risiko'],
  ['frontend/lib/cmt-master-committee.ts', 'Wirtschaftlichkeit & Praxisnutzen'],
  ['frontend/app/api/cmt/master/secure/committee/route.ts', 'askSecureMasterCommittee'],
  ['frontend/app/cmt/master/secure/committee/page.tsx', 'Secure Master + Gremium testen'],
  ['frontend/app/cmt/master/secure/committee/page.tsx', '5 Rollen'],
  ['README_PHASE125_0.md', 'Secure Master Committee Integration'],
  ['package.json', 'phase125:0:verify'],
];
let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) { console.error('MISS', file); ok = false; continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) { console.error('MISS fragment', fragment, 'in', file); ok = false; }
  else console.log('OK', file, fragment);
}
if (!ok) process.exit(1);
console.log('Phase 125.0 Secure Master Committee Integration verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase125:0:verify'] = 'node scripts/v125-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 125.0 Secure Master Committee Integration patch applied.');
