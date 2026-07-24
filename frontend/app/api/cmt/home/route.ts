import { NextResponse } from 'next/server';
import { getCommitteeHomeEntry } from '../../../../lib/cmt-home';

export async function GET() {
  return NextResponse.json(getCommitteeHomeEntry());
}
