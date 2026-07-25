import { NextResponse } from 'next/server';

function createPlan(goal: string) {
  const effectiveGoal = goal || 'Baue dich selbst zu einem nutzbaren Arbeitsagenten weiter.';
  return {
    ok: true,
    mode: 'self_build_plan',
    title: 'Agent-Selbstbauplan',
    summary: 'Der Agent priorisiert ab jetzt Arbeitsmodus, Antwortqualitaet und eigene Patch-Vorschlaege statt weiterer Sicherheits-Dashboards.',
    nextPatchName: 'self-builder-autopatch',
    priority: 'high',
    filesToCreateOrEdit: ['frontend/app/cmt/master/secure/agent/page.tsx', 'frontend/app/api/cmt/master/secure/self-build/plan/route.ts', 'frontend/lib/cmt-secure-master-self-builder.ts'],
    concreteSteps: ['Arbeitsmodus oben sichtbar machen: Frage rein, Antwort raus.', 'Sicherheitsbereiche nach unten schieben oder einklappen.', 'Patch-Vorschlag mit Dateien, Testbefehl und Commit-Message erzeugen.', 'Naechsten Patch als direkte Anweisung fuer VS Code Copilot ausgeben.'],
    guardrails: ['Keine echten API-Keys im Client oder Repo.', 'Keine internen/personenbezogenen Daten extern senden.', 'Keine automatische Dateiaenderung ohne Nutzer-Ausfuehrung.'],
    copilotPrompt: 'Du bist VS Code Copilot im Projekt ai-assistant/agent_creator. Ziel: ' + effectiveGoal + '\n\nBaue den Secure Master Agent jetzt praktisch nutzbar weiter. Prioritaet: Arbeitsflaeche und Selbstbau-Modus statt Diagnose-Dashboard.\n\nErstelle konkrete Datei-Aenderungen, Testbefehle und eine Commit-Message. Keine echten Secrets im Client oder Repo.'
  };
}

export async function POST(request: Request) {
  let body: any = {};
  try { body = await request.json(); } catch {}
  return NextResponse.json(createPlan(typeof body?.goal === 'string' ? body.goal : ''));
}

export async function GET() {
  return NextResponse.json(createPlan('Baue dich selbst weiter.'));
}
