import { NextResponse } from 'next/server';
import { getSecureMasterUnifiedStatus } from '../../../../../../../lib/cmt-master-unified-status';

export async function GET() {
  return NextResponse.json(getSecureMasterUnifiedStatus());
}
