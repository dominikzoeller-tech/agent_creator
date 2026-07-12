import { NextResponse } from 'next/server';
import { getPhase82ArchiveSealFinalClosureBoundaryPolicyAudit } from '../../../lib/p82-1-store';

export async function GET() {
  return NextResponse.json(getPhase82ArchiveSealFinalClosureBoundaryPolicyAudit());
}
