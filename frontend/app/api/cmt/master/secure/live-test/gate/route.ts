import { NextResponse } from 'next/server';
import { createSecureMasterLiveTestGateResult } from '../../../../../../../lib/cmt-secure-master-live-test-gate';

export async function GET() {
  return NextResponse.json(createSecureMasterLiveTestGateResult());
}
