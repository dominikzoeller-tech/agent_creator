import { NextResponse } from 'next/server';
import { getSecureMasterMainStatus } from '../../../../../../../lib/cmt-master-main-status';

export async function GET() {
  return NextResponse.json(getSecureMasterMainStatus());
}
