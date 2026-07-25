import { NextResponse } from 'next/server';
import { secureMasterLiveTestRunbook } from '../../../../../../lib/cmt-secure-master-live-test-runbook';

export async function GET() {
  return NextResponse.json({
    ok: true,
    ...secureMasterLiveTestRunbook,
  });
}
