import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export async function GET() {
  const root = process.cwd();
  const resultPath = join(root, '..', 'tasks', 'last-result.json');
  const logPath = join(root, '..', 'logs', 'last-agent-worker.log');

  if (!existsSync(resultPath)) {
    return NextResponse.json({ ok: false, message: 'tasks/last-result.json fehlt. Worker noch nicht gelaufen.' });
  }

  const result = JSON.parse(await readFile(resultPath, 'utf8'));
  let logPreview = '';
  if (existsSync(logPath)) {
    const log = await readFile(logPath, 'utf8');
    logPreview = log.slice(-8000);
  }

  return NextResponse.json({ ok: true, result, logPreview });
}
