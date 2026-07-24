import { NextResponse } from 'next/server';
import { getSecureMasterMainEntry } from '../../../../../../../lib/cmt-master-main-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterMainEntry());
}
