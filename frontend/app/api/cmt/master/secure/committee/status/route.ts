import { NextResponse } from 'next/server';
import { getSecureMasterCommitteeStatus } from '../../../../../../../lib/cmt-master-committee-status';

export async function GET() {
  return NextResponse.json(getSecureMasterCommitteeStatus());
}
