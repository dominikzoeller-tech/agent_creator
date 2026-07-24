import { NextResponse } from 'next/server';
import { getSecureMasterMainViewEntry } from '../../../../../../../../lib/cmt-master-main-view-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterMainViewEntry());
}
