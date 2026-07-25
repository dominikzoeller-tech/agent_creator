import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createSecureMasterSecretPreflightResult } from '../../../../../../../lib/cmt-secure-master-secret-preflight-check';

export async function GET() {
  const root = process.cwd();
  const envExamplePath = join(root, '..', '.env.example');
  const gitIgnorePath = join(root, '..', '.gitignore');

  const envExampleExists = existsSync(envExamplePath);
  const gitIgnoreExists = existsSync(gitIgnorePath);

  let gitIgnoreText = '';
  if (gitIgnoreExists) {
    try {
      gitIgnoreText = await readFile(gitIgnorePath, 'utf8');
    } catch {
      gitIgnoreText = '';
    }
  }

  return NextResponse.json(createSecureMasterSecretPreflightResult({
    envExampleExists,
    gitIgnoreExists,
    gitIgnoreText,
  }));
}
