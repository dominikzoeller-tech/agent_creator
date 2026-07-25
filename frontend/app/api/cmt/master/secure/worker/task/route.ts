import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const allowedCommandMap: Record<string, string> = {
  status: 'git status --short',
  build: 'npm run build',
  frontendBuild: 'npm --prefix frontend run build',
};

function normalizeCommands(raw: unknown): string[] {
  const requested = Array.isArray(raw) ? raw : ['status', 'build'];
  const commands = requested.map((item) => allowedCommandMap[String(item)]).filter(Boolean);
  return commands.length > 0 ? commands : ['git status --short', 'npm run build'];
}

export async function POST(request: Request) {
  let body: any = {};
  try { body = await request.json(); } catch {}

  const root = process.cwd();
  const taskDir = join(root, '..', 'tasks');
  await mkdir(taskDir, { recursive: true });

  const task = {
    id: 'task_' + Date.now(),
    title: typeof body?.title === 'string' ? body.title.slice(0, 160) : 'Agent Worker Aufgabe',
    goal: typeof body?.goal === 'string' ? body.goal.slice(0, 1000) : 'Build pruefen und Ergebnis melden.',
    allowedCommands: normalizeCommands(body?.commands),
    notes: ['Vom Web-Agent geschrieben.', 'Worker fragt im Terminal vor Ausfuehrung.', 'Keine Secrets ausgeben.'],
    createdAt: new Date().toISOString(),
  };

  await writeFile(join(taskDir, 'next-task.json'), JSON.stringify(task, null, 2), 'utf8');
  return NextResponse.json({ ok: true, taskPath: 'tasks/next-task.json', task });
}

export async function GET() {
  const taskPath = join(process.cwd(), '..', 'tasks', 'next-task.json');
  if (!existsSync(taskPath)) return NextResponse.json({ ok: false, message: 'tasks/next-task.json fehlt.' });
  const task = JSON.parse(await readFile(taskPath, 'utf8'));
  return NextResponse.json({ ok: true, task });
}
