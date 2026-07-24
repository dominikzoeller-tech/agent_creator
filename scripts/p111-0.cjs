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

write('frontend/lib/cmt-session.ts', `import { createCommitteeDeliberation, type CommitteeDeliberation } from './cmt-delib';

export type CommitteeSession = {
  phase: '111.0';
  label: 'User Frage Session';
  sessionId: string;
  userQuestion: string;
  status: 'draft' | 'ready' | 'dry-run-complete';
  deliberation: CommitteeDeliberation;
  createdAt: string;
  dryRunOnly: true;
  provider: 'none';
  modelSelected: 'none';
  networkCallAllowed: false;
  providerDispatchAllowed: false;
  finalDispatchBlocked: true;
};

export function createCommitteeSession(userQuestion: string): CommitteeSession {
  const safeQuestion = userQuestion.trim() || 'Welche Entscheidung soll das Gremium bewerten?';
  return {
    phase: '111.0',
    label: 'User Frage Session',
    sessionId: 'cs-demo-111-0',
    userQuestion: safeQuestion,
    status: 'dry-run-complete',
    deliberation: createCommitteeDeliberation(safeQuestion),
    createdAt: 'dry-run',
    dryRunOnly: true,
    provider: 'none',
    modelSelected: 'none',
    networkCallAllowed: false,
    providerDispatchAllowed: false,
    finalDispatchBlocked: true,
  };
}

export function getCommitteeSessionDemo() {
  return createCommitteeSession('Soll der Agent diese Nutzerfrage an ein internes Gremium geben und eine erste Empfehlung anzeigen?');
}
`);

write('frontend/app/api/cmt/session/route.ts', `import { NextResponse } from 'next/server';
import { createCommitteeSession, getCommitteeSessionDemo } from '../../../../lib/cmt-session';

export async function GET() {
  return NextResponse.json(getCommitteeSessionDemo());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text : '';
  return NextResponse.json(createCommitteeSession(text));
}
`);

write('frontend/app/cmt/session/page.tsx', `import { getCommitteeSessionDemo } from '../../../lib/cmt-session';

export default function CommitteeSessionPage() {
  const session = getCommitteeSessionDemo();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Phase 111.0</h1>
      <h2>{session.label}</h2>
      <p>Eine Nutzerfrage wird als Session erfasst und an das interne Gremium uebergeben.</p>

      <section>
        <h3>User-Frage</h3>
        <p>{session.userQuestion}</p>
        <ul>
          <li>sessionId: {session.sessionId}</li>
          <li>status: {session.status}</li>
          <li>recommendation: {session.deliberation.aggregate.recommendation}</li>
        </ul>
      </section>

      <section>
        <h3>Gremium</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {session.deliberation.opinions.map((opinion) => (
            <article key={opinion.roleId} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
              <h4>{opinion.title}</h4>
              <p><strong>stance:</strong> {opinion.stance}</p>
              <p>{opinion.summary}</p>
              <p><strong>nextStep:</strong> {opinion.nextStep}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3>Naechste Schritte</h3>
        <ul>
          {session.deliberation.aggregate.nextSteps.map((step) => <li key={step}>{step}</li>)}
        </ul>
      </section>

      <section>
        <h3>Safety State</h3>
        <ul>
          <li>provider: {session.provider}</li>
          <li>modelSelected: {session.modelSelected}</li>
          <li>dryRunOnly: {String(session.dryRunOnly)}</li>
          <li>networkCallAllowed: {String(session.networkCallAllowed)}</li>
          <li>providerDispatchAllowed: {String(session.providerDispatchAllowed)}</li>
          <li>finalDispatchBlocked: {String(session.finalDispatchBlocked)}</li>
        </ul>
      </section>
    </main>
  );
}
`);

write('README_PHASE111_0.md', `# Phase 111.0 - User Frage Session

Baut die erste User-Frage-Session fuer den Gremium-Agenten.

Kurz-Namen:

- Store: frontend/lib/cmt-session.ts
- API: /api/cmt/session
- UI: /cmt/session
- Patch: scripts/p111-0.cjs
- Verify: scripts/v111-0.cjs

Funktion:

- User-Frage als Session erfassen
- Session-ID setzen
- bestehende Gremium-Deliberation nutzen
- Empfehlung und naechste Schritte anzeigen

Safety bleibt dry-run-only und blockiert echte Provider-/Netzwerk-Calls.
`);

write('scripts/v111-0.cjs', `const fs = require('fs');

const checks = [
  ['frontend/lib/cmt-session.ts', 'createCommitteeSession'],
  ['frontend/lib/cmt-session.ts', 'getCommitteeSessionDemo'],
  ['frontend/lib/cmt-session.ts', "phase: '111.0'"],
  ['frontend/lib/cmt-session.ts', "label: 'User Frage Session'"],
  ['frontend/lib/cmt-session.ts', 'sessionId'],
  ['frontend/lib/cmt-session.ts', 'userQuestion'],
  ['frontend/lib/cmt-session.ts', 'createCommitteeDeliberation'],
  ['frontend/lib/cmt-session.ts', "provider: 'none'"],
  ['frontend/lib/cmt-session.ts', "modelSelected: 'none'"],
  ['frontend/lib/cmt-session.ts', 'dryRunOnly: true'],
  ['frontend/lib/cmt-session.ts', 'networkCallAllowed: false'],
  ['frontend/lib/cmt-session.ts', 'providerDispatchAllowed: false'],
  ['frontend/lib/cmt-session.ts', 'finalDispatchBlocked: true'],
  ['frontend/app/api/cmt/session/route.ts', 'createCommitteeSession'],
  ['frontend/app/cmt/session/page.tsx', 'Phase 111.0'],
  ['README_PHASE111_0.md', 'User Frage Session'],
  ['package.json', 'phase111:0:verify'],
];

let ok = true;
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    console.error('MISS', file);
    ok = false;
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(fragment)) {
    console.error('MISS fragment', fragment, 'in', file);
    ok = false;
  } else {
    console.log('OK', file, fragment);
  }
}

if (!ok) process.exit(1);
console.log('Phase 111.0 User Frage Session verification OK.');
`);

const pkg = readJson('package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts['phase111:0:verify'] = 'node scripts/v111-0.cjs';
writeJson('package.json', pkg);
console.log('UPDATED package.json');
console.log('Phase 111.0 User Frage Session patch applied.');
