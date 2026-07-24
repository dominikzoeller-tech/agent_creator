import { NextResponse } from 'next/server';
import { getSecureMasterUnifiedEntry } from '../../../../../../../lib/cmt-master-unified-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterUnifiedEntry());
}
