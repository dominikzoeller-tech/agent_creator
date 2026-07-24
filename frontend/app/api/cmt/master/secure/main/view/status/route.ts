import { NextResponse } from 'next/server';
import { getSecureMasterMainViewStatus } from '../../../../../../../../lib/cmt-master-main-view-status';

export async function GET() {
  return NextResponse.json(getSecureMasterMainViewStatus());
}
