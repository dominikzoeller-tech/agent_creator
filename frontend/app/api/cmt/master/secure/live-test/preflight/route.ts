import { NextResponse } from 'next/server';
import { createSecureMasterLivePreflightResult } from '../../../../../../../lib/cmt-secure-master-live-preflight';

export async function GET() {
  return NextResponse.json(createSecureMasterLivePreflightResult());
}
