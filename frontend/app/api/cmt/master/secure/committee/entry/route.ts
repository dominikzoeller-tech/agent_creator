import { NextResponse } from 'next/server';
import { getSecureMasterCommitteeEntry } from '../../../../../../../lib/cmt-master-committee-entry';

export async function GET() {
  return NextResponse.json(getSecureMasterCommitteeEntry());
}
