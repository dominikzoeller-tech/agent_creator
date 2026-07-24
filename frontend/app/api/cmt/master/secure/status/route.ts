import { NextResponse } from 'next/server';
import { getSecureMasterStatus } from '../../../../../../lib/cmt-master-secure-status';

export async function GET() {
  return NextResponse.json(getSecureMasterStatus());
}
