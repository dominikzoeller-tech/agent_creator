import { NextResponse } from 'next/server';

function buildPatch(goal: string) {
  const effectiveGoal = goal || 'Agent praktisch nutzbar machen';
  const script = [
    'const fs = require(\'fs\');',
    'const path = require(\'path\');',
    'const root = process.cwd();',
    'const page = path.join(root, \'frontend/app/cmt/master/secure/agent/page.tsx\');',
    'let text = fs.readFileSync(page, \'utf8\');',
    'if (!text.includes(\'ARBEITSMODUS KOMPAKT\')) {',
    '  text = text.replace(\'Zentrale Agent-Arbeitsseite\', \'Zentrale Agent-Arbeitsseite - ARBEITSMODUS KOMPAKT\');',
    '}',
    'fs.writeFileSync(page, text, \'utf8\');',
    'console.log(\'[OK] compact work mode marker applied\');'
  ].join('\n');
  return {
    ok: true,
    mode: 'self_builder_autopatch',
    title: 'Autopatch-Vorschlag',
    goal: effectiveGoal,
    summary: 'Der Agent erzeugt jetzt einen konkreten Patch-Vorschlag statt nur einen Plan. Der erzeugte Script-Text kann als Datei gespeichert und ausgeführt werden.',
    patchName: 'self-builder-autopatch-generated',
    filesToEdit: ['frontend/app/cmt/master/secure/agent/page.tsx'],
    scriptFileName: 'scripts/generated-self-builder-patch.cjs',
    script,
    testCommands: ['node scripts/generated-self-builder-patch.cjs', 'npm run build', 'npm --prefix frontend run dev'],
    commitMessage: 'feat: apply secure master self builder generated patch',
    nextStep: 'Script in scripts/generated-self-builder-patch.cjs speichern, ausführen, build testen, committen.'
  };
}

export async function POST(request: Request) {
  let body: any = {};
  try { body = await request.json(); } catch {}
  return NextResponse.json(buildPatch(typeof body?.goal === 'string' ? body.goal : ''));
}

export async function GET() {
  return NextResponse.json(buildPatch('Agent praktisch nutzbar machen'));
}
