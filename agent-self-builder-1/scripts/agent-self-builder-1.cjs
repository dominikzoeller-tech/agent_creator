const fs = require('fs');
const path = require('path');
const root = process.cwd();
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('[write]', rel);
};

const route = `import { NextResponse } from 'next/server';

type SelfBuildPlan = {
  ok: true;
  mode: 'self_build_plan';
  title: string;
  summary: string;
  priority: 'high';
  filesToCreateOrEdit: string[];
  concreteSteps: string[];
  copilotPrompt: string;
  nextPatchName: string;
  guardrails: string[];
};

function cleanInput(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 2000) : '';
}

function createSelfBuildPlan(goal: string): SelfBuildPlan {
  const effectiveGoal = goal || 'Den Secure Master Agent endlich als nutzbaren Arbeitsagenten fertigbauen.';

  return {
    ok: true,
    mode: 'self_build_plan',
    title: 'Agent-Selbstbauplan',
    summary: 'Der Agent soll ab jetzt nicht nur Status anzeigen, sondern konkrete Arbeitsfunktionen selbst planen: Antwortmodus, Patch-Vorschlaege, Dateiplan, Testschritte und naechste Umsetzung.',
    priority: 'high',
    nextPatchName: 'agent-self-builder-2',
    filesToCreateOrEdit: [
      'frontend/app/cmt/master/secure/agent/page.tsx',
      'frontend/app/api/cmt/master/secure/self-build/plan/route.ts',
      'frontend/lib/cmt-secure-master-self-builder.ts',
      'scripts/v-agent-self-builder-2.cjs'
    ],
    concreteSteps: [
      'Oben auf der Agent-Seite den Arbeitsmodus priorisieren: Frage rein, Antwort raus.',
      'Sicherheits-/Diagnosebereiche nach unten oder einklappbar machen.',
      'Self-Builder-Ausgabe verwenden, um naechsten Patch in einem Schritt zu planen.',
      'Agent soll jeweils Dateien, Ziel, Risiko, Testbefehl und Commit-Message liefern.',
      'Naechster Patch soll eine direkte Patch-Generator-Ausgabe erzeugen, nicht nur Text.',
      'Danach kann der Agent kontrolliert eigene Patch-ZIPs vorbereiten.'
    ],
    guardrails: [
      'Keine echten API-Keys im Client oder Repo.',
      'Keine internen/personenbezogenen Daten extern senden.',
      'Keine automatische Dateiaenderung ohne explizite Ausfuehrung durch dich.',
      'Build muss nach jedem Patch laufen.'
    ],
    copilotPrompt: `Du bist VS Code Copilot im Projekt ai-assistant/agent_creator. Ziel: ${effectiveGoal}\n\nBaue den Secure Master Agent jetzt praktisch nutzbar weiter. Prioritaet: Arbeitsmodus statt Sicherheits-Dashboard.\n\nAufgaben:\n1. Die Seite /cmt/master/secure/agent soll oben eine klare Arbeitsflaeche haben: Eingabe, Antwort, naechste Aktion, Verlauf.\n2. Diagnose-/Security-Bloecke sollen nach unten oder einklappbar.\n3. Fuege einen Self-Builder-Modus hinzu, der Patchplaene mit Dateien, Schritten, Testbefehl und Commit-Message erstellt.\n4. Keine echten API-Keys im Client. Keine externen Calls ohne Freigabe.\n5. Erstelle moeglichst kleine, robuste Aenderungen.\n6. Stelle sicher, dass npm run build danach durchlaeuft.\n\nGib mir die konkreten Datei-Aenderungen und einen Testplan.`
  };
}

export async function POST(request: Request) {
  let body: any = {};
  try { body = await request.json(); } catch { body = {}; }
  const goal = cleanInput(body?.goal);
  return NextResponse.json(createSelfBuildPlan(goal));
}

export async function GET() {
  return NextResponse.json(createSelfBuildPlan('Den Agenten selbst weiterbauen.'));
}
`;
write('frontend/app/api/cmt/master/secure/self-build/plan/route.ts', route);

const pageRel = 'frontend/app/cmt/master/secure/agent/page.tsx';
const pagePath = path.join(root, pageRel);
if (!fs.existsSync(pagePath)) {
  console.error('[missing]', pageRel);
  process.exit(1);
}
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('const [selfBuildGoal, setSelfBuildGoal]')) {
  const marker = /const \[input, setInput\] = useState\(''\);/;
  if (marker.test(page)) {
    page = page.replace(marker, "const [input, setInput] = useState('');\n  const [selfBuildGoal, setSelfBuildGoal] = useState('Baue dich selbst weiter zu einem wirklich nutzbaren Arbeitsagenten.');\n  const [selfBuildPlan, setSelfBuildPlan] = useState<any | null>(null);");
  } else {
    page = page.replace(/export default function Page\(\) \{/, "export default function Page() {\n  const [selfBuildGoal, setSelfBuildGoal] = useState('Baue dich selbst weiter zu einem wirklich nutzbaren Arbeitsagenten.');\n  const [selfBuildPlan, setSelfBuildPlan] = useState<any | null>(null);");
  }
}

if (!page.includes('async function runSelfBuildPlan')) {
  const marker = 'function exportLogs() {';
  if (page.includes(marker)) {
    page = page.replace(marker, `async function runSelfBuildPlan() {
    try {
      const response = await fetch('/api/cmt/master/secure/self-build/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ goal: selfBuildGoal }),
      });
      setSelfBuildPlan(await response.json());
    } catch (error) {
      setSelfBuildPlan({ ok: false, error: 'self_build_plan_failed' });
    }
  }

  function copySelfBuildPrompt() {
    const text = selfBuildPlan?.copilotPrompt || '';
    if (text) navigator.clipboard?.writeText(text);
  }

  ${marker}`);
  }
}

if (!page.includes('Agent-Selbstbau')) {
  const insertBefore = '<section style={{ display: \'grid\', gridTemplateColumns: \'minmax(0, 1.2fr) minmax(280px, 0.8fr)\', gap: 20 }}>';
  const block = `<section style={{ border: '2px solid #22c55e', borderRadius: 18, background: '#052e16', padding: 20 }}>
          <h2>Agent-Selbstbau</h2>
          <p style={{ color: '#bbf7d0' }}>Kurswechsel: Der Agent plant ab jetzt konkrete Weiterbau-Patches, statt nur Sicherheitsstatus zu zeigen.</p>
          <textarea
            value={selfBuildGoal}
            onChange={(event) => setSelfBuildGoal(event.target.value)}
            style={{ width: '100%', minHeight: 84, borderRadius: 12, border: '1px solid #166534', background: '#020617', color: '#e5e7eb', padding: 12 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <button onClick={runSelfBuildPlan} style={{ border: 0, borderRadius: 10, background: '#22c55e', color: '#052e16', padding: '10px 14px', fontWeight: 700 }}>Selbstbauplan erzeugen</button>
            <button onClick={copySelfBuildPrompt} style={{ border: '1px solid #22c55e', borderRadius: 10, background: '#020617', color: '#e5e7eb', padding: '10px 14px' }}>Copilot-Prompt kopieren</button>
          </div>
          {selfBuildPlan && (
            <div style={{ marginTop: 12, border: '1px solid #166534', borderRadius: 12, background: '#020617', padding: 12 }}>
              <h3>{selfBuildPlan.title ?? 'Selbstbauplan'}</h3>
              <p>{selfBuildPlan.summary}</p>
              <p>Naechster Patch: <b>{selfBuildPlan.nextPatchName}</b> | Prioritaet: <b>{selfBuildPlan.priority}</b></p>
              <h4>Dateien</h4>
              <ul>{selfBuildPlan.filesToCreateOrEdit?.map((item: string) => <li key={item}>{item}</li>)}</ul>
              <h4>Konkrete Schritte</h4>
              <ul>{selfBuildPlan.concreteSteps?.map((item: string) => <li key={item}>{item}</li>)}</ul>
              <h4>Guardrails</h4>
              <ul>{selfBuildPlan.guardrails?.map((item: string) => <li key={item}>{item}</li>)}</ul>
              <h4>Copilot-Prompt</h4>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#0f172a', borderRadius: 10, padding: 12, color: '#cbd5e1' }}>{selfBuildPlan.copilotPrompt}</pre>
            </div>
          )}
        </section>

        `;
  if (page.includes(insertBefore)) {
    page = page.replace(insertBefore, block + insertBefore);
  } else {
    const fallback = '<section style={{ border: \'1px solid #22d3ee\', borderRadius: 18, background: \'#0f172a\', padding: 20 }}>';
    page = page.replace(fallback, block + fallback);
  }
}

write(pageRel, page);

const verify = `const fs=require('fs');const path=require('path');const root=process.cwd();let ok=true;for(const rel of ['frontend/app/api/cmt/master/secure/self-build/plan/route.ts','frontend/app/cmt/master/secure/agent/page.tsx']){if(!fs.existsSync(path.join(root,rel))){console.error('[missing]',rel);ok=false}else console.log('[ok]',rel)}const page=fs.readFileSync(path.join(root,'frontend/app/cmt/master/secure/agent/page.tsx'),'utf8');for(const token of ['Agent-Selbstbau','runSelfBuildPlan','selfBuildPlan','Selbstbauplan erzeugen','Copilot-Prompt kopieren']){if(!page.includes(token)){console.error('[missing token]',token);ok=false}else console.log('[ok token]',token)}if(ok)console.log('[OK] agent-self-builder-1 verify passed');process.exit(ok?0:1);`;
write('scripts/v-agent-self-builder-1.cjs', verify);

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['selfbuilder1:verify'] = 'node scripts/v-agent-self-builder-1.cjs';
pkg.scripts['agent:selfbuilder1:verify'] = 'node scripts/v-agent-self-builder-1.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[write] package.json scripts selfbuilder1:verify agent:selfbuilder1:verify');
console.log('[OK] agent-self-builder-1 applied');
